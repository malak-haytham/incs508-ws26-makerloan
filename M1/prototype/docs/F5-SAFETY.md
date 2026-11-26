# F5 Safety briefing verification

These are the implementation requirements for F5 based on business goal BG4. The project SRS remains the authoritative requirements document; its R13–R15 statements and classifications must be completed by the SRS author.

## Requirements and acceptance checks

| ID | Class | Requirement | Acceptance check | Implementation / trace |
|---|---|---|---|---|
| R13 | FR | When an authorized staff member records that a borrower completed a safety briefing, the system shall store the borrower, the recording staff member, and the completion date and time, and mark the borrower as safety-certified. | Record a briefing for an active borrower. Confirm a briefing record has the borrower, actor, and server timestamp, the borrower’s certification becomes true, and an audit entry is written. An unknown or non-borrower ID is rejected. | `POST /api/safety/briefings`; `F5SafetyService.recordBriefing`; `SafetyBriefing` schema; `f5-safety.service.spec.ts` |
| R14 | FR | When equipment requires a safety briefing, the system shall reject checkout if the selected borrower is not safety-certified. | Check out safety-controlled equipment to an uncertified borrower and confirm checkout fails before any loan or equipment state is changed. Certified borrowers and equipment that does not require a briefing pass this safety check. | F2 checkout guard (`F2CheckoutCheckinService.checkout`) on `f2-checkout-checkin`; currently implemented there by checking `item.requiresSafetyBriefing && !borrower.safetyCertified`. The F2 checkout operation must include R14 in Swagger and its tests when that branch is integrated. |
| R15 | NFR — Security | The system shall permit only desk assistants, managers, and safety officers to view briefing records or borrower certification, or to record briefing completion. Any other authenticated role shall receive HTTP 403. | Call each safety endpoint as each allowed role and as a borrower role. Allowed roles receive the endpoint response; borrower roles receive 403. Unauthenticated requests receive 401. | `@Roles(...)` on every safety endpoint; global `RolesGuard`; `f5-safety.controller.spec.ts`; Swagger responses |

## Endpoint and UI traceability

| Requirement | Endpoint / screen |
|---|---|
| R13 | `POST /api/safety/briefings`; F5 Record briefing form |
| R14 | `POST /api/loans/checkout` safety guard in F2 |
| R15 | `GET /api/safety/borrowers`, `GET /api/safety/briefings`, `GET /api/safety/status/:borrowerId`, `POST /api/safety/briefings`; F5 safety staff page |

Briefing completion time is assigned by the server in UTC. The check-out gate is evaluated by F2 before it mutates equipment, loan, or reservation state. The SRS author should place R13–R14 under F5 in Section 4 and R15 in Section 5.3 (Security), retaining R14's cross-feature implementation trace to F2.
