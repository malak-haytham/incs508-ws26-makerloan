# MakerLoan — Backend (NestJS)

NestJS + TypeScript + Mongoose (MongoDB). Authentication uses Passport-JWT with access and refresh tokens stored only in httpOnly cookies. API documentation is generated with Swagger.

## Prerequisites
- Node.js 20 or newer
- A MongoDB connection string (MongoDB Atlas or a local MongoDB). Ask the team lead for the shared one.

## Setup
```bash
cp .env.example .env     # Windows cmd: copy .env.example .env
# edit .env (see below)
npm install
npm run seed             # demo users + equipment (only needed once per database)
npm run start:dev
```
- API base: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`
- Health check: `GET /api/health`

## Environment variables (`.env`, never commit this file)
| Variable | Purpose |
|---|---|
| `PORT` | Server port (default 3000) |
| `MONGO_URI` | MongoDB connection string. The line must contain the name only once: `MONGO_URI=mongodb://...` |
| `FRONTEND_ORIGIN` | Allowed CORS origin (default `http://localhost:5173`) |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Token signing secrets (use long random text) |
| `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL` | Token lifetimes (`15m`, `7d`) |
| `COOKIE_SECURE` | `true` by default; set `false` only if cookies are rejected on plain-http localhost |

## Demo accounts (password `Password123`)
`student@giu-uni.de`, `certified@giu-uni.de` (safety-certified), `staff@giu-uni.de`, `lecturer@giu-uni.de`, `desk@giu-uni.de`, `manager@giu-uni.de`, `safety@giu-uni.de`.
Log in with **Auth → POST /api/auth/login** in Swagger; the cookie is then sent automatically.

## Scripts
| Command | What it does |
|---|---|
| `npm run start:dev` | Run with auto-reload |
| `npm run build` / `npm run start:prod` | Compile and run the compiled app |
| `npm run seed` | Insert demo users and equipment (skips what already exists) |

## Structure
```
src/
  auth/ users/ audit/ notifications/   shared infrastructure
  common/                              guards, decorators, error filter, enums
  equipment/ loans/ reservations/ safety/   shared Mongoose schemas
  domain.module.ts                     registers all shared models
  features/                            one folder per feature / member
    f1-availability-reservations/      R01–R03
    f2-checkout-checkin/               R04–R06
    f3-status-tracking/                R07–R09
    f4-overdue/                        R10–R12
    f5-safety/                         R13–R15
```
Read [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) before writing code. Key points:
- All routes are protected by default; use `@Public()` to opt out and `@Roles()` to restrict by role.
- Errors have the shape `{ statusCode, message, error, timestamp, path }`.
- Check-out and check-in call `AuditService.log()`; overdue events and safety-briefing failures call `NotificationsService.notify()`.
- Check-out is blocked when the item requires a safety briefing and the borrower's `safetyCertified` is false.
- Every endpoint documents its requirement ID (R01–R15) in its Swagger description.

## Troubleshooting
- **`MongoParseError: Invalid scheme`**: `MONGO_URI` doesn't start with `mongodb://` or `mongodb+srv://` (often the name is repeated, `MONGO_URI=MONGO_URI=...`).
- **`querySrv ECONNREFUSED`**: your network blocks the DNS lookup used by `mongodb+srv://`. Use the standard `mongodb://host1,host2,host3/...` connection string instead.
- **`bad auth`**: wrong database username or password.
- **Server selection timeout**: your IP isn't allowed in Atlas Network Access, or your network blocks port 27017.
- **Login works but `/api/auth/me` returns 401**: set `COOKIE_SECURE=false` and restart.
