# Deriv Auto Trader Frontend

The Phase Zero frontend uses React, Vite, TypeScript, React Router, and Tailwind CSS. The starter UI has been replaced with a responsive, accessible foundation workspace with light and dark appearance support.

## Setup

Copy `.env.example` to `.env`. Set `VITE_API_URL` and the assigned `VITE_DERIV_APP_ID`. The UI validates public configuration and presents a safe setup state until those values are valid; it does not collect a Deriv password.

## Commands

- `npm run dev` starts Vite.
- `npm run format`, `npm run lint`, `npm run typecheck`, and `npm run build` verify the project.
