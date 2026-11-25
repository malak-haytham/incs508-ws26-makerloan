# MakerLoan — Prototype

A working prototype of MakerLoan for Milestone 1. It demonstrates the five selected features (F1–F5) and the requirements R01–R15 from the SRS (`../SRS.md`).

- `backend/` — NestJS + Mongoose API with Swagger documentation
- `frontend/` — React + Vite web app

## Prerequisites
- Node.js 20 or newer
- A MongoDB database (MongoDB Atlas or local) and its connection string. Ask the team lead for the shared one.

## How to run

**1. Database and backend** (see [`backend/README.md`](backend/README.md) for details)
```bash
cd backend
cp .env.example .env     # Windows cmd: copy .env.example .env
# paste MONGO_URI into .env and set the two JWT secrets
npm install
npm run seed             # demo users + equipment (once per database)
npm run start:dev        # API: http://localhost:3000/api  Swagger: http://localhost:3000/api/docs
```

**2. Frontend** (in a second terminal; see [`frontend/README.md`](frontend/README.md))
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Run order: MongoDB → backend → frontend.

## Demo accounts (password `Password123`)

| Account | Role | Notes |
|---|---|---|
| `student@giu-uni.de` | Student | Not safety-certified |
| `certified@giu-uni.de` | Student | Safety-certified |
| `staff@giu-uni.de` | Staff | Not safety-certified |
| `lecturer@giu-uni.de` | Lecturer | Safety-certified |
| `desk@giu-uni.de` | Desk assistant | Hands out and takes back equipment |
| `manager@giu-uni.de` | Manager | Mr. Richter's role |
| `safety@giu-uni.de` | Safety officer | Ms. Okafor's role |

Backend only: log in via **Auth → POST /api/auth/login** in Swagger; the session cookie is then sent with every request.

## Features

| Feature | Backend folder | Frontend folder | Owner | Requirements |
|---|---|---|---|---|
| F1 Availability search and reservations | `backend/src/features/f1-availability-reservations` | `frontend/src/features/f1-availability-reservations` | Malak Haytham | R01–R03 |
| F2 Check-out and check-in at the desk | `backend/src/features/f2-checkout-checkin` | `frontend/src/features/f2-checkout-checkin` | Renad Hesham | R04–R06 |
| F3 Item status and location tracking | `backend/src/features/f3-status-tracking` | `frontend/src/features/f3-status-tracking` | Arwa Ismail | R07–R09 |
| F4 Overdue handling | `backend/src/features/f4-overdue` | `frontend/src/features/f4-overdue` | Mohamed Amro | R10–R12 |
| F5 Safety briefing verification | `backend/src/features/f5-safety` | `frontend/src/features/f5-safety` | Marwan Abdelaal | R13–R15 |

## Demo walkthrough (full loan lifecycle)

_TODO (Member 4): replace with the final script once the features are merged._

1. **Check availability (F1):** log in as `student@giu-uni.de`, search the catalogue, see which items are available and which are take-home or in-house only.
2. **Reserve (F1):** reserve an available item for a date; cancel a reservation.
3. **Safety check (F5):** as `student@giu-uni.de`, try to borrow a power tool and see it blocked; as `certified@giu-uni.de` the same item is allowed.
4. **Check out (F2):** as `desk@giu-uni.de`, hand the item to a borrower; the due date and borrower are recorded.
5. **Track the item (F3):** see where the item is, who has it, and when it is due.
6. **Overdue (F4):** show a loan past its due date flagged as overdue and the reminder notification.
7. **Check in (F2):** as the desk assistant, take the item back and record its condition.

## Traceability: requirements ↔ prototype

_TODO (Member 2, traceability owner): complete once the SRS is final. The same table is kept in `../SRS.md`._

| Requirement | Feature | Type (FR/NFR/C) | Backend endpoint (Swagger) | Frontend screen |
|---|---|---|---|---|
| R01 | F1 | | | |
| R02 | F1 | | | |
| R03 | F1 | | | |
| R04 | F2 | | | |
| R05 | F2 | | | |
| R06 | F2 | | | |
| R07 | F3 | | | |
| R08 | F3 | | | |
| R09 | F3 | | | |
| R10 | F4 | | | |
| R11 | F4 | | | |
| R12 | F4 | | | |
| R13 | F5 | | | |
| R14 | F5 | | | |
| R15 | F5 | | | |

## Notes
- Never commit `.env` files; they contain database credentials.
- Work on your own branch and open a pull request into `Itr1`.
- AI-assisted work is logged in `../../AI-USE.md`.