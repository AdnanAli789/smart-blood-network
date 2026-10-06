# Smart Blood Network

A responsive blood donor coordination app with a React/Vite/Tailwind client and an Express/SQLite API.

## Requirements

- Node.js 18+
- npm 9+

## Setup and run

```bash
cd D:\python\smart-blood-network-web
npm install
npm run install:all
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:4000` (the Vite dev server proxies `/api`).

For a production build:

```bash
npm run build
npm start
```

The SQLite database is created at `server/data/blood-network.db` on first start. Sample donors, requests, and responses are seeded automatically when the database is empty.

## Included workflows

- Dashboard summary, urgent request alerts, recent activity, and analytics
- Donor registration, searchable donor list, availability and verification status
- Blood request creation, list/detail views, priority and status tracking
- Compatibility-aware matching using ABO/Rh compatibility and distance
- Verification controls for donors and requests
- Accept/decline donor responses and completion of fulfilled requests

## API

`GET /api/dashboard`, `GET/POST/PATCH /api/donors`, `GET/POST/PATCH /api/requests`, `GET /api/requests/:id/matches`, `POST /api/requests/:id/responses`, `PATCH /api/responses/:id`, `POST /api/requests/:id/complete`, and `GET /api/analytics`.
