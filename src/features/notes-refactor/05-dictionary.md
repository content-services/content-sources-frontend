# Dictionary of Terms

### Handler

A command, a signal by a user, which is sent to the app core, using the use-case function signatures.

### Use-Case

Descriptions (function signatures, ports) of what should happen when a user interacts with the application.

### Feature

aka Vertical Slice. Semantically connected use-cases together with UI and api, all the related code (from various "technical layers") put together.

### Workflow

Multiple features put together, which are semantically connected.

### Bounded Context

A term from domain modelling. An isolated module which communicates with other modules only through its ports. Usually groups together related features. The whole Content Sources service is a bounded context with respect to other Insights apps developed by other teams.

### Abstraction Levels

A way to structure code if it becomes too detailed and noisy. Gradual layers of code that allow us to focus only on the most important things. If we need further details, we dive into a particular function/procedure/module which encapsulates the further details.
