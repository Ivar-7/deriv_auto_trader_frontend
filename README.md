# Deriv Auto Trader Frontend

The Phase Zero through Two frontend uses React, Vite, TypeScript, React Router, and Tailwind CSS. It includes responsive account connectivity plus an account-bound safety console with proposal validation, risk limits, lifecycle controls, Emergency Stop, reconciled contract state, and activity events. Styling is Tailwind-only with light and dark appearance support.

## Setup

Copy `.env.example` to `.env` and set `VITE_API_URL`. The backend owns Deriv OAuth configuration; the frontend starts the Deriv login handoff through the API and never collects a Deriv password.

## Commands

- `npm run dev` starts Vite.
- `npm run format`, `npm run lint`, `npm run typecheck`, and `npm run build` verify the project.
