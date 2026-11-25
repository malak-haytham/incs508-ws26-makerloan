# MakerLoan — Frontend (React + Vite + TS)

React + Vite + TypeScript web app for the MakerLoan prototype. It talks to the NestJS backend through `/api` and relies on httpOnly cookies for login, so no tokens are handled in the browser code.

## Prerequisites
- Node.js 20 or newer
- The backend running on `http://localhost:3000` (see [`../backend/README.md`](../backend/README.md))

## Setup
```bash
npm install
npm run dev        # http://localhost:5173
```
The Vite dev server proxies `/api` to `http://localhost:3000`, so the frontend and API share one origin and the login cookies work without extra CORS settings. Start the backend first.

## Demo logins (password `Password123`)
`student@giu-uni.de` (prefilled on the login page), `certified@giu-uni.de`, `staff@giu-uni.de`, `lecturer@giu-uni.de`, `desk@giu-uni.de`, `manager@giu-uni.de`, `safety@giu-uni.de`.

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |

## Structure
```
src/
  main.tsx                 app entry (router + auth provider)
  App.tsx                  routes: one route per feature
  api/
    client.ts              axios instance (sends cookies, refreshes the session on 401)
    types.ts               shared TypeScript types (User, Equipment, Role)
  auth/
    AuthContext.tsx        current user, login, logout
    ProtectedRoute.tsx     redirects to /login; optional role restriction
  components/
    Layout.tsx             page frame and navigation menu
  pages/                   Login, Home
  features/                one folder per feature / team member
    f1-availability-reservations/   F1Page.tsx   (R01–R03)
    f2-checkout-checkin/            F2Page.tsx   (R04–R06)
    f3-status-tracking/             F3Page.tsx   (R07–R09)
    f4-overdue/                     F4Page.tsx   (R10–R12)
    f5-safety/                      F5Page.tsx   (R13–R15)
```

## Working on a feature
- Work only inside your own `src/features/<feature>/` folder. Create extra components, hooks and API calls there.
- The route and the navigation link for your page are already wired in `App.tsx` and `Layout.tsx`, so you normally don't need to edit them.
- Call the backend with the `api` instance from `src/api/client.ts`, for example `api.get('/availability')`. Use `errorMessage(err)` to show server errors.
- Restrict a page by role with `<ProtectedRoute roles={['DESK_ASSISTANT']} />` in `App.tsx`. This only controls what the screen shows; the backend enforces access.
- Mark the UI elements that demonstrate a requirement with its ID (for example a visible label or `data-req="R04"`), so the traceability table in the SRS can point to them.
- Add types for new data to `src/api/types.ts` only if more than one feature needs them.

## Troubleshooting
- **Blank data or `404` on API calls:** the backend isn't running on port 3000.
- **Redirected to the login page right after logging in:** set `COOKIE_SECURE=false` in the backend `.env` and restart the backend.
- **Port 5173 is in use:** stop the other process, or Vite will pick the next free port. In that case update `FRONTEND_ORIGIN` in the backend `.env` to match.