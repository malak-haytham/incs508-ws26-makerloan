# F1 – Availability Search and Reservations (R01–R03)

Owner: Malak Haytham. Branch: `f1-availability-reservations`.

## Status rules (BR-01)

Availability is computed at search time and is not stored. F1 never changes `Equipment.status`.

| Shown status | Rule |
|---|---|
| Checked Out | `Equipment.status` is `ON_LOAN` (set by F2 at check-out) |
| Reserved | not Checked Out, and an `ACTIVE` reservation exists for today |
| Available | neither |

Retired items are not listed.

## Requirements to code

| Requirement | Endpoint | Roles | Rules |
|---|---|---|---|
| R01 | `GET /api/availability` | any logged-in user | `search`: partial, case-insensitive name match. `category`: exact, case-insensitive. Optional filters `canLeaveMakerspace` and `availability`. Returns `items`, `count`, `tookMs` |
| R02 | `POST /api/reservations` | STUDENT, STAFF, LECTURER | One calendar day (stored as midnight UTC). Date must be after today. Item must exist, not be retired and not be on loan. One active reservation per item per day (409 on a clash) |
| R03 | `tookMs` in the R01 response | — | Server time of the search, compared with the 2-second target. The frontend also shows the round trip |

Supporting endpoints (not required by R01–R03, listed as TBD in the SRS):
- `GET /api/reservations/mine`: the caller's own reservations.
- `PATCH /api/reservations/:id/cancel`: cancel your own active reservation.

## Error codes

| Code | When |
|---|---|
| 400 | invalid query or body, past or today's date, retired or checked-out item, cancelling a non-active reservation |
| 401 | not logged in |
| 403 | role is not a borrower, or cancelling someone else's reservation |
| 404 | equipment or reservation not found |
| 409 | the item is already reserved for that day |

## Files

- Backend: `src/features/f1-availability-reservations/` (service, two controllers, DTOs, module)
- Frontend: `frontend/src/features/f1-availability-reservations/` (`F1Page.tsx`, `f1.css`)