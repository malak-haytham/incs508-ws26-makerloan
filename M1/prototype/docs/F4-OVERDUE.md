# F4 Overdue handling

Owner: Mohamed Amro (Member 4). Case statement 7 "Overdue handling", business goal BG3 (reduce overdue and lost equipment).
The SRS is the authoritative requirements document. The R10–R12 wording below is the current draft and will be finalised in the F4 section of `../../SRS.md`.

## Which prototype element demonstrates which requirement

| ID | Class | Requirement (draft) | Demonstrated by | How to check |
|---|---|---|---|---|
| R10 | FR | When a loan's due date and time has passed and the item has not been checked in, the system shall flag the loan as Overdue so that loan desk assistants can see it in the list of active loans. | Scheduled job `F4OverdueService.flagOverdue` (every minute) and `POST /api/overdue/run`; `GET /api/overdue`; "Overdue loans" table and "Flagged overdue" column on the Overdue page; `OVERDUE` badge in F2's active-loans table (`GET /api/loans/active`) | Check out an item with a due time a minute ahead. After it passes, the loan shows as `OVERDUE` on the Overdue page and the Desk page. An `OVERDUE_FLAGGED` audit entry holds the flag time. A loan checked in before its due time is never flagged. |
| R11 | NFR (timeliness) | The system shall send the first reminder for an overdue loan to the borrower within 15 minutes after the loan is flagged as Overdue, for at least 95% of overdue loans in a calendar month, measured as the difference between the flag timestamp and the reminder-sent timestamp in the system log. | `F4OverdueService.sendFirstReminders` runs in the same job right after flagging. `OVERDUE_REMINDER_SENT` audit entry with `flaggedAt`, `sentAt` and `delayMs`. "Reminder sent" and "Delay" columns. `GET /api/overdue/timeliness?year=&month=` and the "R11 this month" card. | The delay column shows the minutes between flag and reminder, with a "≤ 15 min" badge. The timeliness endpoint returns the month's percentage and `meetsR11` (target 95%). |
| R12 | C | Overdue reminders shall be sent only by email, through the university's existing email service, to the borrower's university account address. | Only one channel exists in code (`REMINDER_CHANNEL = 'email'`). The reminder goes to `borrower.email`, the university account the borrower logs in with. "Reminder sent to" column (EMAIL badge and address). The note under the table. | Each reminder's notification and audit entry has `channel: "email"` and `to: <university address>`. The server log shows `[MOCK EMAIL via university email service] to=...`. |

## Mock email
The prototype has no email credentials. Sending is simulated: the job writes a log line, stores a `Notification` (type `OVERDUE_REMINDER`, channel and address in `metadata`) and an audit entry, and sets `loan.lastReminderAt`. In production this call would go to the university's email service (University IT).

## Endpoints (Swagger tag "F4 Overdue Handling")
| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/api/overdue` | Desk assistant, manager | Overdue loans with flag time, reminder address, reminder time and delay |
| POST | `/api/overdue/run` | Desk assistant, manager | Runs the flag + reminder job now (same code as the every-minute job) |
| GET | `/api/overdue/timeliness` | Desk assistant, manager | R11 check for one calendar month |

Borrower roles get 403, logged-out requests get 401.

## Demo (about 2 minutes)
1. Log in as `desk@giu-uni.de`. On **Desk**, check out a take-home item. To avoid waiting a day, use Swagger `POST /api/loans/checkout` with a `dueDate` one minute in the future.
2. Wait until the due time has passed. Within a minute the job flags the loan; or press **Run overdue check now** on the **Overdue** page.
3. The **Overdue** page shows the loan with the flag time, `EMAIL` to the borrower's university address, the reminder time and the delay. The backend log shows the mock email line.
4. On **Desk**, the loan has an `OVERDUE` badge. Check it in; it disappears from the Overdue page.
5. Log in as `student@giu-uni.de`: the Overdue page says only desk staff can see it, and `GET /api/overdue` returns 403.

## Design decisions (open points the team decides)
- Only the first reminder is sent. R11 covers the first reminder; repeat reminders are not specified, so none are implemented.
- No grace period: a loan is overdue as soon as its due date and time has passed, as R10 states.
- The job interval (1 minute) is an implementation choice that keeps the reminder delay well under the 15-minute R11 limit.
