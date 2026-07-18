# Deriv Auto Trader Frontend

The Phase Zero through Five frontend uses React, Vite, TypeScript, React Router, and Tailwind CSS. It includes responsive account connectivity, an account-bound safety console, market analysis, single-bot sessions, Differs Scanner, and Bulk Trader. The scanner surfaces observed digit deviations, its 3/3 confirmation guard, and safe Auto Bulk availability; Bulk Trader supports fixed-stake manual runs and Smart Auto Bulk profiles. Styling is Tailwind-only with light and dark appearance support.

## Setup

Copy `.env.example` to `.env` and set `VITE_API_URL`. The backend owns Deriv OAuth configuration; the frontend starts the Deriv login handoff through the API and never collects a Deriv password.

## Commands

- `npm run dev` starts Vite.
- `npm run format`, `npm run lint`, `npm run typecheck`, and `npm run build` verify the project.
