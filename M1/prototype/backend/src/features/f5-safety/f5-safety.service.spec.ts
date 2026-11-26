import 'reflect-metadata';
import test from 'node:test';
import assert from 'node:assert/strict';
import { Types } from 'mongoose';
import { Role } from '../../common/enums/role.enum';
import { F5SafetyService } from './f5-safety.service';

test('R13 records borrower, staff member, completion time, certification, and audit entry', async () => {
  const borrowerId = new Types.ObjectId();
  const actorId = new Types.ObjectId();
  const briefingId = new Types.ObjectId();
  const borrower: any = {
    _id: borrowerId,
    id: borrowerId.toString(),
    role: Role.STUDENT,
    fullName: 'Test Borrower',
    safetyCertified: false,
    save: async () => undefined,
  };
  const created: any[] = [];
  const audited: any[] = [];
  const service = new F5SafetyService(
    { create: async (record: any) => { created.push(record); return { ...record, id: briefingId.toString() }; } } as any,
    { findById: () => ({ exec: async () => borrower }) } as any,
    { log: async (entry: any) => { audited.push(entry); } } as any,
  );

  const result = await service.recordBriefing(borrowerId.toString(), { _id: actorId, id: actorId.toString() } as any);

  assert.equal(created.length, 1);
  assert.equal(created[0].user, borrowerId);
  assert.equal(created[0].recordedBy, actorId);
  assert.ok(created[0].briefedAt instanceof Date);
  assert.equal(borrower.safetyCertified, true);
  assert.equal(audited[0].action, 'SAFETY_BRIEFING_RECORDED');
  assert.equal(audited[0].actorId, actorId.toString());
  assert.equal(audited[0].entityId, briefingId.toString());
  assert.equal(result.borrower.safetyCertified, true);
});

test('R13 rejects malformed borrower identifiers before database access', async () => {
  let queried = false;
  const service = new F5SafetyService(
    {} as any,
    { findById: () => { queried = true; return { exec: async () => null }; } } as any,
    {} as any,
  );

  await assert.rejects(service.recordBriefing('not-an-object-id', {} as any), (error: any) => error.getStatus() === 400);
  assert.equal(queried, false);
});

test('R13 rejects users who do not have a borrower role', async () => {
  const nonBorrower = { _id: new Types.ObjectId(), id: 'staff-id', role: Role.DESK_ASSISTANT };
  const service = new F5SafetyService(
    {} as any,
    { findById: () => ({ exec: async () => nonBorrower }) } as any,
    {} as any,
  );

  await assert.rejects(service.recordBriefing(nonBorrower._id.toString(), {} as any), (error: any) => error.getStatus() === 404);
});

test('R14 returns certification state and the latest recorded completion time for the check-out gate', async () => {
  const borrowerId = new Types.ObjectId();
  const briefedAt = new Date('2026-11-26T10:30:00.000Z');
  const borrower: any = { _id: borrowerId, id: borrowerId.toString(), role: Role.STUDENT, fullName: 'Test Borrower', email: 'student@example.test', safetyCertified: false };
  const service = new F5SafetyService(
    { findOne: () => ({ sort: () => ({ exec: async () => ({ briefedAt }) }) }) } as any,
    { findById: () => ({ select: () => ({ exec: async () => borrower }) }) } as any,
    {} as any,
  );

  const result = await service.getStatus(borrowerId.toString());

  assert.equal(result.safetyCertified, false);
  assert.equal(result.latestBriefingAt, briefedAt);
  assert.equal(result.borrower.id, borrowerId.toString());
});
