# Backend conventions (read before writing code)

## Where things live
| Path | Owner | Notes |
|---|---|---|
| `src/features/f1-…` | Member 1 (R01–R03) | Availability search + reservations |
| `src/features/f2-…` | Member 2 (R04–R06) | Check-out / check-in |
| `src/features/f3-…` | Member 3 (R07–R09) | Item status & location tracking |
| `src/features/f4-…` | Member 4 (R10–R12) | Overdue handling |
| `src/features/f5-…` | Member 5 (R13–R15) | Safety briefing verification |
| `src/{auth,users,audit,notifications,common,equipment,loans,reservations,safety,domain.module.ts}` | Shared / lead | Change via PR, tell the team |

Stay inside your feature folder. If you need a shared schema field, ask the lead (it affects everyone).

## Already provided
- Global `JwtAuthGuard` (cookie JWT, user loaded from DB, suspended/deactivated rejected) — **all routes are protected by default**; use `@Public()` to opt out.
- Global `RolesGuard` — use `@Roles(Role.DESK_ASSISTANT, …)`.
- `@CurrentUser()` gives the DB user document.
- `AllExceptionsFilter` — all errors are `{statusCode,message,error,timestamp,path}`.
- `AuditService.log()` (call on every check-out/check-in), `NotificationsService.notify()` (overdue events, safety-briefing failures). Both are global — just inject.
- All Mongoose models are registered in `DomainModule` — inject with `@InjectModel(Equipment.name)`.
- Business rule: check-out must reject if `equipment.requiresSafetyBriefing && !borrower.safetyCertified` (and call `notify`). F2 owns the call site, F5 owns the rule/recording.

## Worked example (Swagger + validation + role + audit)
```ts
// dto/create-thing.dto.ts
export class CreateThingDto {
  @ApiProperty({ description: 'Equipment id' }) @IsMongoId() equipmentId: string;
}

// controller
@Post()
@Roles(Role.DESK_ASSISTANT)
@ApiOperation({ summary: 'Do the thing', description: 'R04: The system shall …' })
@ApiResponse({ status: 201, description: 'Created' })
@ApiResponse({ status: 403, type: ErrorResponseDto })
create(@Body() dto: CreateThingDto, @CurrentUser() user: UserDocument) {
  return this.service.create(dto, user);
}
```
Throw Nest `HttpException`s (`BadRequestException`, `ConflictException`, …) — never return error objects by hand.

## Rules
- Do not invent limits (loan periods, max items, grace periods) that the requirement text doesn't state. Put the number in the requirement first, then in code.
- Never return `passwordHash` / `refreshTokenHash` (schema `toJSON` already strips them).
- Tokens only in httpOnly cookies, never in a response body.
- Requirement IDs (R01–R15) in every endpoint's Swagger description → feeds the traceability table.
