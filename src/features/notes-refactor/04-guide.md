## Steps to building a feature slice

1. divide into semantic pieces, single concern, group and separate the components in the return with its data and logic (data transformations), into its own components
2. separate out use cases (locate affordances in the ui), use-case data transformation pipelines that are application specific
3. compose use-case with UI and infrastructure in custom hooks
4. define runtime store api and data
5. provide ubiquitous types to domain entities
6. define input and output ports
7. colocate coupled or adapted infrastructure and container components into the feature slice

## What to watch out for

This approach is not without its downsides, as everything.

### Higher effort to maintain the structure

Developers have to make bigger effort maintain the structure. They will have to learn about the approach a bit first. They will have to do some thinking before putting a new code somewhere.

### Increased indirection

There are more files and modules than with the old structure. On the one hand, the code captures more information about the domain and use-cases. On the other hand, there are simply more files, so there is more "glue" that connects the code (the compositional code).

### Keeping slices separated

Ideally, each vertical slice should work on its own and not share code with another slice. It can refer to a shared code, which is conceptually a different part. This might introduce code duplication at places, where slices want to share code.

There has to be put more thinking into how to share code. It might signal that 2 slices are simply connected too much and should really be only one slice. Or we can call functionality from another slice [through its port and define an adapter for it](https://bespoyasov.me/blog/explicit-design-8/#feature-communication). Or to make it even more decoupled use [event-driven approach](https://bespoyasov.me/blog/explicit-design-9/).

### Introducing 2 conceptually different structures

The new code introduces a different structure from the old one. It might be problematic to maintain the 2 types of structures. We might want to gradually convert rest of the code. This also might be a problem though if we as a team were not conviced it would pay off.

### Need to watch out for keeping the code from succumbing to ball of mud

Even this structure might over time succumb to a ball of mud - if the vertical slices are not kept, use-cases call functions from other slices, and generaly the established boundaries between parts dissolve.
