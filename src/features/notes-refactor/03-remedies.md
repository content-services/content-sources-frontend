# Remedies

Let's disect a few examples and explain the used techniques. The CustomRepositoriesStep component is 380 lines long. It suffers from all the maladies described above.

## 1. Separate concerns, first in UI

> Open the [CustomRepositoriesStep](/src/Pages/Templates/TemplatesTable/components/AddOrEditTemplate/steps/CustomRepositoriesStep.tsx) component and try to define for yourself what things this page does. Focus on the components in the return, which data it needs and then which logic provides that data.

```typescript
export default function CustomRepositoriesStep() {
    // complicated mix of state hooks, custom hooks, react query hooks, handlers and functions
    // which logic goes to which child components?
    ...

    // pile of components with changing levels of nesting indicating different unnamed unseparated semantic sections
    return(
        ...
________________<Td>
____________________<PackageCount ... />
________________</Td>
____________</Tr>
____________);
________})}
________</Tbody>
____</Table>
____<Hide hide={countIsZero}>
________<Flex className={classes.topBottomContainers}>
____________<FlexItem>
_________________<Pagination ... />
____________</FlexItem>
________</Flex>
____</Hide>
    )
}
```

So to separate the code, we have to do a mental work to delineate where one semantic section ends and another starts. We have to go into the details, read the little constituent components, figure out how they go together and put a label on that group.

When we do this separation, we can see the [top level component](/src/features/createTemplateWorkflow/otherRepositories/ui/OtherRepositories.tsx) really consists of just 3 parts: a `Table with Repositories`, `Table Controls` and `Table Heading`. And that it comes in 3 versions depending on the state of data - either loading table or empty table or the default filled table.

```typescript
export default function OtherRepositoriesSection() {
  // reading state flags from the store for this step
  const { isLoading, ... } = useOtherRepositoriesState();
  ...
  // derive other UI flags specific only to this component
  ...
  // return 3 different versions based on the state of data
  if (isLoading) {...}
  if (isEmpty) {...}
  return (
    <Grid ...>
      <TableHeading />
      <TableControls />
      <OtherRepositoriesTable />
      <TableBottomPagination />
    </Grid>
  );
}
```

In terms of data and logic, it just needs to read the flags in which state of the data is and derive other UI data specific only to this component. Hide components were replaced with early return to get rid of deep nesting. This helped to avoid using Hide components and constant checking of state flags down in the tree of children.

The original component is called CustomRepositoriesStep. However this table displays not only custom repositories, but also a new type of community repositories. Therefore the name was changed to OtherRepositoriesSection.

We can easily fit and keep this piece of code in our head and only dive into the subsection that interests us.

## 2. Logic separation

All logic and data relevant to the OtherRepositores step was moved out of the components and placed into React Context - the [OtherRepositoriesStore](/src/features/createTemplateWorkflow/otherRepositories/store/OtherRepositoriesStore.tsx) component. It specifies the API (useOtherRepositoriesApi, useSort) for this step as well as the data (useOtherRepositoriesState, usePagination). Children components in the tree then use its API and data. They don't care about any domain data transformations, only the UI state that is relevant for them. All the stores follow the same structure.

```typescript
export const OtherRepositoriesStore = ({ children }) => {
    // state relevant to the step
    const [page, setPage] = useState(1);
    ...

    // other external custom hooks the step depends on
    const queryClient = useQueryClient();
    ...

    // access to the top level store
    const { otherUUIDs, hardcodedUUIDs } = useOtherRepositoriesSlice();
    ...

    // api relevant for this step
    const otherReposApi = useMemo(() => {
        const turnPage = (newPage: number) => setPage(newPage);
        ...
        return {...}
    }, []);

    // state and derived data to be shared in the childer components in this step
    const otherReposData = useMemo(() => {
        const areOtherReposToSelect = repositoriesList.length - otherUUIDs.length > 0;
        ...
        return {...}
    }, []);

    ...
};
```

There is another higher-level store for the whole workflow, where the template request to be sent is being composed [TemplateRequestStore](/src/features/createTemplateWorkflow/workflow/store/TemplateRequestStore.tsx). The lower level stores dedicated to their particular steps then connect to this store. The top level store is kept deliberately focused only on the state of the template request, which all of the steps gradually build up. Any derived data that steps need for their functioning are pushed into their respective stores.

```typescript
export const TemplateRequestStore = ({ children }) => {
    // state of the TemplateRequest kept in state hooks
    const [selectedArchitecture, setArchitecture] =
        useState<FirstEmpty<AllowedArchitecture>>(undefined);
    ...

    // api for TemplateRequest
     const templateRequestApi = useMemo(() => {
        ...
        const api = {
            resetTemplateRequestContent,
            setArchitecture,
            ...
        }
     },[])

    // api to get the state of TemplateRequest
    const templateRequestState =useMemo(() => {...}, [...])

    // other TemplateRequest state slices for individual steps
    const snapshotsSlice = useMemo(() => {...}, [...])
    ...
};
```

### The problem of React Context rerenderings

You may wonder why there are quite a lot of separate React Contexts defined. When using React Context as a UI store, we have to be extra careful to avoid rerenderings of the consuming components. A good strategy is to first divide between functions, that do not change after their definition ("api"), and state to be read in the components, which keeps changing. The state can then be further divided to multiple slices if we want to keep loosely related state separate and avoid rerenderings.

## 3. Business processes = use-cases are the focal point

The focal point of the OtherRepositories subfeature is the functionality of toggling an other repository in the [OtherRepositoriesTable](/src/features/createTemplateWorkflow/otherRepositories/ui/components/Table.tsx) to select it into a new template or not. The only component that truly cares about this is the `Checkbox` component.

The [toggleChecked use-case](/src/features/createTemplateWorkflow/otherRepositories/core/use-cases/chooseOtherUUIDs.ts) in this case is a simple CRUD operation, we are just saving/removing the selected UUID into/from the [TemplateRequest storage](/src/features/createTemplateWorkflow/workflow/store/TemplateRequestStore.tsx), there is no other data transformation needed.

```typescript
const toggleChecked = (clickedUuid: string) => {
    setOtherUUIDs((previous) => {
        const isInPrevious = previous.includes(clickedUuid);
        if (isInPrevious) {
            return previous.filter((uuid) => uuid !== clickedUuid);
        } else {
            return [...previous, clickedUuid];
        }
    });
```

### Pipeline of data transformations

Only when a use-case involves multiple steps, grouping the steps and separating them out start to pay off. Let's take the example of the [chooseHardcodedRedhatUUIDs use-case](/src/features/createTemplateWorkflow/defineRepositoryVersion/core/use-cases/chooseHardcodedUUIDs.ts).

A use-case is nothing more than a pipeline of data transformations, with a clear start and end, that molds the input data into a final shape. A pipeline is apparent if we just focus on the types of data in the chooseHardcodedRedhatUUIDs use-case:

```typescript
// a chain of data transformation
SelectedRepositoryVersion -> FullRepository[], HardcodedRepositoryUrls -> HardcodedUuid[] -> void

// overall use-case process type
type ChooseHardcodedUUIDs = (version: SelectedRepositoryVersion) => Promise<void>;

// the individual steps
// 1. request server to send all relevant repositories for the particular architecture-os version combination
type FetchHardcodedRepositories = (version: SelectedRepositoryVersion) => Promise<FullRepository[]>;

// 2. find urls for the combination
type LookupHardcodedRedhatRepoUrls = (type: SelectedRepositoryVersion) => HardcodedRepositoryUrls;

// 3. take out the required hardcoded uuids for the combination
type FilterHardcodedUUIDs = (
    repositories: FullRepository[],
    urls: HardcodedRepositoryUrls
) => HardcodedUuid[];

// 4. save the uuids into react state
type SaveHardcodedUUIDs = Dispatch<SetStateAction<HardcodedUuid[]>>;
```

Start of the pipeline is a signal from a user who made an interaction with the app, an effect. End of a pipeline is another effect, in React apps usually saving to a runtime storage, which makes React rerender and show data on a screen.

```typescript
// clear api - it accepts version, returns void
const chooseHardcodedRedhatUUIDs: ChooseHardcodedUUIDs = async (version) => {
  // effect
  const repositories = await fetchHardcodedRepositories({
    architecture: version.architecture,
    osVersion: version.osVersion,
  });
  // domain
  const hardcodedRedhatRepoUrls = lookupUrls(version);
  // domain
  const uuids = filterHardcodedUUIDs(repositories, hardcodedRedhatRepoUrls);
  // effect
  setHardcodedUUIDs(uuids);
};
```

To make a use-case easily testable and reprodroducible, it is good to `separate pure functions from functions with effects`. Anything which requests or gets data from a server (like **fetchHardcodedRepositories** function), reads or saves to runtime store (like **setHardcodedUUIDs**) , uses browser's local storage persistence or sends analytics data out for logging or collecting.

In the middle of this effect "sandwich" are only pure domain functions left. This composition is called [Impureim sandwich](https://blog.ploeh.dk/2020/03/02/impureim-sandwich/). These pure functions, like **lookupUrls**, map input values to particular output values, like a mathematical function. This way we can focus on the code with effects, where a problem can occur more likely.

> To learn more about benefits of the pure functions versus effects division check out Eric Normand's book [Grokking Simplicity: Taming Complex Software with Functional Thinking](https://ericnormand.me/grokking-simplicity)

### Workflow

If there are more steps in a bigger use-case, we talk about a `workflow`, as is the case in the Create Template Workflow. Multiple separated use-case chains are put together to create the final `TemplateRequest`.

```typescript
// individual use-cases that constitute the workflow
chooseArchitecture ->
chooseOSVersion ->
chooseHardcodedUUIDs ->
chooseAdditionalUUIDs ->
chooseOtherUUIDs ->        TemplateRequestInProgress
toggleUseLatestSnapshot ->
chooseSnapshotDate ->
validateTitle ->
validateDetail ->

// stages that a template goes through
TemplateRequestInProgress -> TemplateRequestFinalized -> TemplateRequestToSend -> FullTemplate
```

Since every step of TemplateRequest creation consists of multiple use-cases a user can trigger, there are grouped first into subfeatures, even though I see it conceptually as a single pipeline stitched together.

```
createTemplateWorkflow
> defineRepositoryVersion
> additionalRepositories
> otherRepositories
> repositoriesSnapshots
> describeTemplate
> reviewTemplateRequest
> createTemplate
> workflow
```

## 4. Domain

The "meat" of a particular app, its unique functionalities and shapes of data, is called a domain. It contains the unique business logic, the essence of what the app is about.

### Domain core = pure functions and use-cases, workflow

In the domain core of the defineRepositoryVersion subfeature we have pure functions under the domain folder and use-cases, which are embodied business processes. These are what provide business value - the particularities of data transformations. It should be clear what apis to use to call these use-cases.

```
> defineRepositoryVersion
    > core
        > domain
            lookupUrls.ts
            ...
        > use-cases
            chooseHardcodedUUIDs.ts
            ...
```

### Explicit types of the business processes - input ports to the core

To make explicit which functions trigger the business domain functionality we can define so called `input ports`. They define a specification or a contract what shape of data the domain core accepts, which functionalities it provides to the UI and what it returns. It is simply the type of the use-cases a user can initiate from the UI.

The UI then needs to adapt its data to be able to call the core, and conceptually it is placed outside of the domain core.

```typescript
// input ports of the defineRepositoryVersion subfeature
type SelectArchitecture = (architecture: AllowedArchitecture) => void;
type SelectOSVersion = (version: AllowedOSVersion) => void;
type ChooseHardcodedUUIDs = (version: SelectedRepositoryVersion) => Promise<void>;
```

### Domain Types

The other part of a domain is its `domain types`. The types describe business entities the app works with in its various stages. Names of domain types are supposed to be the same business people or users use when they talk about their business. The app should also use these names in the code, so a `ubiquitous language` among developers, business people and users is created and a gap among them disappers ideally.

For instance, the original code uses a type called `TemplateItem` that describes a template in the stage when it has been already created on the server and sent in full back to the UI. However, I've only heard people talk about templates, not template items. Therefore, I refer to the same type as `FullTemplate`. It describes the last stage in the lifecycle of template creation.

The shared folder for the CreateTemplate workflow is mainly used for defining the types the workflow works with:

```typescript
// types relevant to a template creation
> types.simple.ts
> types.compound.ts
> types.template.full.ts

// other related types the workflow works with
> types.repository.ts
> types.snapshot.ts
```

### Output ports

The use-cases of a domain core rely on other services to be able to function properly. They rely on an api service and a storage service.

Now if we want to make the domain decoupled from particular infrastructure, we can define an interface, which the infrastructure would have to adapt to.

Or we can skip this and call the infrastructure functions directly. I chose this option, since I don't expect that React Query or React Context Store will be changed in the near future. Conceptually though, the use-cases are separated from the infrastructure code, so it would not be hard to decouple it and change it, if need be.

```typescript
const chooseHardcodedRedhatUUIDs = async (version) => {
    // calling react query function directly
    const repositories = await fetchHardcodedRepositories(...)
    ...
    // calling react context setState function directly
    setHardcodedUUIDs(uuids);
};
```

It is still good to be explicit what services the core needs, so there are also output ports defined in the domain:

```typescript
// output ports of the defineRepositoryVersion subfeature
type FetchHardcodedRepositories = (version: SelectedRepositoryVersion) => Promise<FullRepository[]>;
```

## 5. Vertical Slice = Feature

Vertical slice groups together all the related code. If we need to make a change, we usually need to touch code from multiple "technical layers" (api, runtime store, domain logic). It is better to colocate them together, which improves coherence of the whole app.

**What changes together should live together.**

> Check out [graphics](https://miro.com/app/board/uXjVJnXZv1E=/) showing slices of the create template workflow with dependencies

The defineRepositoryVersion subfeature groups all the code that it relies on:

```
defineRepositoryVersion
> api
> core
> store
> ui
```

### React custom hooks as a way of composition

The individual use-cases are defined as simple functions with inputs and outputs. However, we need to import other infrastructure code, as well as share it with in UI components. Since we use React for UI and store, custom hooks are used as a way of composition of use-cases:

```typescript
// composing runtime store service and api service for the use-case
export const useChooseHardcodedUUIDs = () => {
    // import api service
    const fetchHardcodedRepositories = useFetchHardcodedRepositories();
    // import runtime store service
    const { setHardcodedUUIDs } = useTemplateRequestApi();

    // use-case
    const chooseHardcodedRedhatUUIDs = async (version) => {...};

    // share the use-case in the ui, avoid rerenders
    return useCallback(chooseHardcodedRedhatUUIDs, []);
};
```

## 6. Outside a Slice

What is left outside of slices? It is a service code that is generic and reusable over multiple projects. We can define reusable hooks, UI components without any business logic, api service, generic react context runtime store or persistence service.

If an infrastructure code is particularly coupled with a feature, it should be put under the feature slice and not in generic services.

```
app
> features // vertical slices and workflows
> components // reusable ui components
> hooks // generic hooks
> services
```

### UI - container and presentational components

In the UI it is worth to divide between components that are aware of the domain - they call a particular use-case or read domain data. These are "container components" and should go into a particular feature slice.

The presentational components on the other hand don't know anything about any domain and just display what is given to them. These are the reusable UI components.
