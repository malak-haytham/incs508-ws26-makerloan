# incs508-ws26-makerloan

**Course:** INCS508 / CSEN406 Requirements Engineering, Winter 2026
**Institution:** German International University (GIU)
**Case:** MakerLoan (Equipment Loans for a University Makerspace)
**Milestone:** M1 (SRS and Prototype)
**Submission branch:** `Itr1`

## Team

| # | Student ID | Full Name | GitHub Username | Role |
|---|------------|-----------|-----------------|------|
| 1 | 16001898 | Malak Haytham | malak-haytham | F1 Availability search and reservations (R01–R03) |
| 2 | 16002993 | Renad Hesham | renad006 | F2 Check-out and check-in at the desk (R04–R06) |
| 3 | 16001317 | Arwa Ismail | ARwa-Ismail | F3 Item status and location tracking (R07–R09) |
| 4 | 16003231 | Mohamed Amro | Whosfng | F4 Overdue handling (R10–R12) |
| 5 | 17001987 | Marwan Abdelaal | Moscowabdelaal | F5 Safety briefing verification (R13–R15) |

## Repository structure

```text
README.md             this file
AI-USE.md             log of all AI-assisted work
M1/
  SRS.md              Software Requirements Specification (F1–F5, R01–R15)
  prototype/
    backend/          NestJS + MongoDB API (Swagger at /api/docs)
    frontend/         React + Vite web app
```

## Deliverables

- `M1/SRS.md`: Software Requirements Specification (5 features F1-F5, 15 requirements R01-R15, PDRE methodology)
- `M1/prototype/`: vibe-coded prototype demonstrating the features and requirements
- `AI-USE.md`: log of every AI-assisted prototype interaction

## How to run the prototype

Requirements: Node.js 20 or newer and a MongoDB connection string (ask the team lead).
Full instructions: [`M1/prototype/README.md`](M1/prototype/README.md) and [`M1/prototype/backend/README.md`](M1/prototype/backend/README.md).

```bash
# backend
cd M1/prototype/backend
cp .env.example .env        # then paste the shared MONGO_URI
npm install
npm run start:dev           # http://localhost:3000/api/docs

# frontend (second terminal)
cd M1/prototype/frontend
npm install
npm run dev                 # http://localhost:5173
```

Demo logins (password `Password123`): `student@`, `certified@`, `staff@`, `lecturer@`, `desk@`, `manager@`, `safety@` + `giu-uni.de`.

## Traceability

The SRS ↔ prototype traceability table for R01–R15 is in `M1/SRS.md`.

## Working rules

Work on your own branch and open a pull request into `Itr1` (direct pushes are blocked). Log every AI-assisted prototype interaction in `AI-USE.md`.
