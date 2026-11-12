# AGENTS.md

Project: Frontend for Red Hat's content sources service (React + TypeScript + PatternFly React)

Backend: <https://github.com/content-services/content-sources-backend

## Dev environment setup
- Use `nvm use` to match node version in `.nvmrc`
- Run `yarn patch:hosts` for initial setup
- Always be connected to Red Hat VPN

## Commit guidelines
- Follow Conventional Commits format: `type(scope): description`
- Common types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Explain the "why" in the commit message, not the "what".