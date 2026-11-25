# MakerLoan prototype

- `backend/` — NestJS + Mongoose API, Swagger at `/api/docs`
- `frontend/` — React + Vite UI

Run order: MongoDB → `backend` (`npm run seed && npm run start:dev`) → `frontend` (`npm run dev`).
Member 4 (integration owner) maintains the full demo script here.

| Feature | Backend folder | Frontend folder | Owner | Reqs |
|---|---|---|---|---|
| F1 Availability & Reservations | `features/f1-…` | `features/f1-…` | Member 1 | R01–R03 |
| F2 Check-out & Check-in | `features/f2-…` | `features/f2-…` | Member 2 | R04–R06 |
| F3 Item Status & Tracking | `features/f3-…` | `features/f3-…` | Member 3 | R07–R09 |
| F4 Overdue Handling | `features/f4-…` | `features/f4-…` | Member 4 | R10–R12 |
| F5 Safety Verification | `features/f5-…` | `features/f5-…` | Member 5 | R13–R15 |
