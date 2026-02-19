# CREATE TEMPLATE REFACTOR

These notes describe the code design choices for the refactor of the **Create Template Feature**. The refactor also proposes a different organization of code from the current one.

Please go through these notes before reviewing the code. Some of the choices might seem complicated and not so common in React apps. You may dislike them at first. However, there are sound reasons behind them that I want to convey to you via this document.

At the same time, consider the proposed changes, in fact the whole refactor, as a form of a "spike" - a testing ground for new things that will hopefully make the frontend better.

**I highly welcome and seek your feedback.**

There might be stuff that I missed or I'm not aware of at the moment which could throw a monkey wrench into this. I would like to gather feedback from you at first. If this makes sense to you as well, and only after that we can merge it. Otherwise, I'm fine with trying to find a different way or throwing it out altogether (only then I might cry quietly :-)

I would be happy if I spurred a bit of conversation on the topics of quality of our code on the frontend, its readability, changeablity, extendability and maintainability.

## General Considerations

The refactor proposes a different structure of code from the current one. The concepts it draws from can be labeled as "vertical sliced" or "feature sliced" with a "domain core modelled with functions" and "ports and adapters" at the edges. I find it is all really a variation on the old question of modularity.

The overall aim is to make functionality explicit and easy to change. Functionality and types create a so called domain. Making a domain explicit is suitable for larger or long-to-be-maintained products that have a need for increased code readability, changeability, extendability and maintanability. Since Content Sources app falls within that, I took it up for this refactor, even though it is not so commonly used on frontend apps.

It is important to note that I used the mentioned concepts as guiding principles to make our code better and not a dogma to blindly follow 100%. I focused on their practical application to solve the issues I experienced. There is always a spectrum to choose how much to apply a particular concept.

I will try to convey the main points, but these are the relevant resources you can dive into for more information. I suggest watching the first video at least.

> Watch a video [Modularizing the Monolith by Jimmy Bogard](https://www.youtube.com/watch?v=fc6_NtD9soI) that introduce the **vertical sliced** approach.

> "Explicit architecture" and "ports and adapters" are explained in an [comprehensive article](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/) by Herberto Graca.

> There is an [article series](https://github.com/bespoyasov/explicit-design/tree/main) on how to apply the "explicit architecture" approach on the frontend by Alex Bespoyasov, which I draw most stuff from.

> To learn about **domain modelling** and **modelling a domain core with functions**, there is an amazing book [Domain Modeling Made Functional](https://fsharpforfunandprofit.com/books/) by Scott Wlaschin

> Lastly on the topic of refactoring in general there is a [whole book](https://github.com/bespoyasov/refactor-like-a-superhero/tree/main), again by Alex Bespoysov.

I believe the app outgrew its current code structure, as it has evolved into a bigger codebase with multiple functionalities. These functionalities are not explicit and are obfuscated by the current structure. The need for a different code organization came up from the problems I had experienced, which I described in detail below. And since the frontend is not yet so big, I wanted to try to apply this structure before it would get too big.

## Definition of "good enough"

The goal is to make the code coherent, easy to change, modular and readable. If a developer needs to make a change, they find all the related code grouped together. It is clear what functionalities the app provides.
