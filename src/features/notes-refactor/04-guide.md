## Steps to building a feature slice

1. divide into semantic pieces, single concern, group and separate the components in the return with its data and logic (data transformations), into its own components
2. separate out use cases (locate affordances in the ui), use-case data transformation pipelines that are application specific
3. compose use-case with UI and infrastructure in custom hooks
4. define runtime store api and data
5. provide ubiquitous types to domain entities
6. define input and output ports
7. colocate coupled or adapted infrastructure and container components into the feature slice

## Downsides

TODO:  
what can be tricky  
higher effort to mantain the structure  
increased indirection
keeping slices separated --> code duplication  
how to share code

## What to watch out for

TODO:  
keep it from succumbing to ball of mud  
what to keep in mind  
best practices
