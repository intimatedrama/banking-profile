# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Install all dependencies (run once after cloning):
```bash
npm run install:all
```

Start both servers concurrently (frontend + backend):
```bash
npm run dev
```

Start servers individually:
```bash
npm run dev --prefix server   # Express on http://localhost:5000
npm run dev --prefix client   # Vite/React on http://localhost:5173
```

Build the frontend for production:
```bash
npm run build --prefix client
```

There are no tests or linters configured in this project.

## Architecture

This is a monorepo with a React/Vite frontend (`client/`) and an Express backend (`server/`), coordinated by a root `package.json` that uses `concurrently` to run both dev servers together.

**Backend (`server/index.js`)**: A single-file Express server. All profile data is stored in an in-memory `profiles` array — there is no database or file persistence. Data is lost when the server restarts. The server exposes:
- `POST /profiles` — creates a profile (accepts arbitrary JSON body fields, auto-assigns `id` and `createdAt`)
- `GET /profiles` — returns all profiles
- `GET /profiles/:id/json` — download as JSON
- `GET /profiles/:id/csv` — download as CSV (key,value rows)
- `GET /profiles/:id/txt` — download as plain text

**Frontend (`client/src/App.jsx`)**: A single React component that manages a form and a profile list via `useState`. It talks directly to `http://localhost:5000` (hardcoded). The form fields (`full_name`, `employment`, `income`, `housing_status`, `notes`) are the current profile schema — extending the schema means adding fields to both the form state and the JSX inputs. After saving, the component re-fetches the full profile list from the server.

**No build-time API proxy is configured** — the frontend fetches `http://localhost:5000` directly, so both servers must be running for the UI to work.
