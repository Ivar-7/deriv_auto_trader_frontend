# Deriv Auto Trader Frontend

The Phase Zero through Seven frontend uses React, Vite, TypeScript, React Router, and Tailwind CSS. It includes public landing, legal/risk/FAQ content; responsive account connectivity; a persistent authenticated workspace; an account-bound safety console; market analysis; single-bot sessions; Differs Scanner; Bulk Trader; private Copy Trading; charts; risk controls; activity; settings; Aviator unavailability; and account-scoped Open Trades/Trade History. The scanner surfaces observed digit deviations, its 3/3 confirmation guard, and safe Auto Bulk availability; Bulk Trader supports fixed-stake manual runs and Smart Auto Bulk profiles; Copy Trading presents independent sub-account validation and partial outcomes; records provide filters, details, and CSV export. Real-account automation is server-gated by disclosure acceptance. Styling is Tailwind-only with light and dark appearance support.

## Setup

Copy `.env.example` to `.env` and set `VITE_API_URL`. In Vercel, set it to `https://deriv-auto-trader-frontend.vercel.app` and use the project’s `/api` rewrite to forward requests to the backend. This keeps the browser session cookie same-origin. The backend owns Deriv OAuth configuration; the frontend starts the Deriv login handoff through the API and never collects a Deriv password.

## Commands

- `npm run dev` starts Vite.
- `npm run format`, `npm run lint`, `npm run typecheck`, and `npm run build` verify the project.
