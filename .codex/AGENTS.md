# React + Vite + TypeScript

## Architecture

- **Application** — `src/app/`: application providers and layouts.
- **Features** — `src/features/<feature>/`: pages, components, state, API operations, and tests for one domain.
- **Shared** — `src/shared/`: reusable UI, HTTP infrastructure, hooks, and utilities.

## Core Rules

- **Types** — Enable TypeScript strict mode and use no `any`.
- **Boundaries** — Keep pages focused on route composition and feature components focused on one concern.
- **Data** — Keep remote data separate from local interaction state.
- **Validation** — Validate external data at API and form boundaries.
- **Routing** — Lazy-load route modules.
- **Accessibility** — Use semantic controls, keyboard support, and visible focus states.

## Project Conventions

- **Naming** — Use `*.api.ts`, `*.keys.ts`, `*.types.ts`, `*.schema.ts`, `*Provider.tsx`, `*Page.tsx`, and `use<Thing>.ts`.
- **Firebase** — Use authorization rules; create required indexes; deploy rule and index changes.
- **Errors** — Use `src/shared/errors/` for normalized application errors, user messages, and diagnostic logging; never show raw errors to users.
- **Environment** — Maintain `.env.example`; expose only public configuration through `VITE_` variables.
- **Secrets** — Store no secrets in source or client environment files.
- **Code** — Use no dead code or linter suppressions.
- **Documentation** — Maintain a README for every feature.
- **Design** — Use Tailwind classes only and no arbitrary values.
- **Theme** — Support light and dark themes everywhere.
- **Motion** — Use Motion only for transitions and feedback.
- **States** — Handle loading, empty, success, and error in every feature.

## Verification

- **Checks** — Run `npm run format`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`; fix failures.
