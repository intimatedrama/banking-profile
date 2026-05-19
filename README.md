# Banking Profile UI

A reusable local/sandbox application-profile builder for creating structured applicant profiles, reviewing application-ready data, and exporting JSON/CSV/TXT for personal reference or mock projects.

This project is intended for authorized use, demos, and sandbox workflows only. It does not submit applications to real financial institutions, carriers, or lenders.

## What it includes

- Express API server
- React + Vite frontend
- Profile form UI
- Saved profile list
- JSON, CSV, and TXT export endpoints
- Safe sample profile data structure

## Quick start

```bash
npm install
npm run install:all
npm run dev
```

Frontend: http://localhost:5173

Backend: http://localhost:5000

## Project structure

```text
server/       Express backend
client/       React frontend
```

## Suggested Copilot prompts

```text
Add a multi-step wizard for bank, telco, credit card, and loan application profiles.
```

```text
Add import from JSON and CSV files.
```

```text
Add local-only encryption before saving profiles.
```
