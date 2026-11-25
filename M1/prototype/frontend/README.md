# MakerLoan — Frontend (React + Vite + TS)

```bash
npm install
npm run dev     # http://localhost:5173  (proxies /api -> http://localhost:3000)
```
Start the backend first. Login defaults are prefilled (`student@giu-uni.de` / `Password123`; see backend README for other roles).

Each member works only in `src/features/<their-feature>/` and adds one nav link in `components/Layout.tsx` (already wired). Use `api` from `src/api/client.ts` — it sends cookies and auto-refreshes the session.
