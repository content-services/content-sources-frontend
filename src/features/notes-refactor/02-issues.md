# Issues

## Present State - Classical React App

The current code organization follows a classical React app structure with small reusable components, hooks, api and pages. Pages compose use-cases using the reusable components. React Query in v3 is used as a caching and networking library, together with axios. React Context serves as a UI storage.

We can say there are 2 abstraction levels - the bottom-level contains single purpose components and the top-level consists of pages which combine them. And that is enough when an app starts, as there is a limited number of use-cases.

## Ball of Mud Builds Up

Pretty much every React application starts in a similar manner. However, as it gets bigger, acquiring new use-cases and features, the coherency of the app starts to fall apart. Pages have to compose more and more use-cases. If a single page is the place of multiple use-case compositions, complexity of logic goes up. If use-cases are not strictly separated into individual functions, they start to mix up. There are more and more api calls and data transformations. React hooks complicate data flow even more.

All of a sudden, it is not clear what is going on - which affordance in the UI starts a particular use-case, which other UI components it builts upon, which api calls that use-case needs and how it transforms data. Which workflow or a feature a particular use-case combine into and how many features there are. Ball of mud starts to build up. It is hard to orient oneself in the incoherent code. There has come up a need to start structuring the app into more `abstraction levels` and `semantic groups` than just the 2 (the components and pages).

And this is exactly where Content Sources app finds itself.

# Describing the Issues

## 1. Incoherent mesh in Pages

Specifically, the "Ball of Mud" state is where pages under Pages folder find themselves. They are an incoherent mesh of code. They try to combine multiple use-cases and their data transformations for a pile of UI components each of them gathers. They are written as one giant component, easily reaching 500 lines of code. There is a page (ContentListTable), which reaches 930 lines.

> Go open [ContentListTable](/src/Pages/Repositories/ContentListTable/ContentListTable.tsx). Without reading into the details, can you say which functionalities (like editTemplate, makeRepositorySnapshot) a user can trigger on that page?

It is hard to understand where one functionality ends and another starts. It is hard to understand what a particular piece of code does. Which use-case does it belong to? There is no `separation of concerns`. Each time we want to change a detail on that page, we have to understand and go through all of it. We have to mentaly group together the parts that go together. It would be better to make this explicit, to define separate functions and components for these groups once so we don't have to keep doing this again and again every time we work with this page.

## 2. Too much cognitive load at once

A human mind has a limit to how much information it can digest at once. Code in Pages is too "noisy", too detailed and difficult to fit in our head at once. This is where we need abstraction levels to separate the intent and implementation. It will help us focus on what are important details at a particular level where we are in a code. We need to be able to get into code gradually. In Content Sources there are missing `abtraction levels` in between the very bottom and the very top, between only those 2 abstraction levels defined in the app.

> check out image of [abstraction levels](https://miro.com/app/board/uXjVJnXZv1E=/?moveToWidget=3458764655193094367&cot=14)

## 3. No Coherence - Put together what changes together

Standard technique to avoid The Ball of Mud is to divide and group by "horizontal" technical concern - database or frontend store layer, api layer, hooks or services layer, ui components layer. This is what Content Sources app currently follows and The Ball of Mud in Pages has emerged nonetheless.

Better is to create `semantic groups` of code which follow a particular aim and `slice "vertically"` through all these technical layers. A slice colocates logically coupled code that provides a particular capability - a particular feature - together. When we need to make a change to a particular part, we have all the related code colocated together and separated from unrelated code.

> Check out an image of [technical layers vs vertical slice](https://miro.com/app/board/uXjVJnXZv1E=/?moveToWidget=3458764655192645873&cot=14)

## 4. Hide components obfuscate multiple code paths

The piling up of UI components on a Page is frequently mixed up with Hide components. These components conditionally turn parts of code on and off. The whole code complexity goes up with the number of code paths there are. To simplify this, we need to make the conditions flat and clear. `Early return` technique can come to the rescue.

## 5. Use-case logic spread thin over multiple state hooks

React Query library is great if we just need to read data from a server, where use-cases reside, in a UI component and render it right away, without any further processing. So called "thin client". However, if we need to transform the data or depend on multiple server requests, and there are use-cases to be composed on the frontend, React Query complicates that, since it acts both as "storage service" and "networking service".

These complications manifest in the practice of saving middle states of use-case data transformations into React's state hooks, just to trigger React Query's hooks. That makes React go through its full rendering cycle multiple times. Plus the whole use-case is spread out and hard to follow. `Separate each use-case` into its own function and treat it as one `data transformation pipeline`, with clear start and end.

> Open SetUpDateStep component. Try to map the use-case pipeline from the point when a user selects a date of a snapshots. What are the steps that happen after? Which api calls are made? What is the UI supposed to display?

## 6. No domain types and functionality clearly spelled out

Can we tell what the app is able to do by just gradually diving into the folders of Content Sources? Besides noticing Repositories and Templates pages, we cannot figure this out without reading and untangling the code in Pages. Apps are about providing functionalities to users, so what functionalities does the app provide? What is a user able to do? A `domain`, the core of an app, with `domain types` and `use-cases`, is not explicit.
