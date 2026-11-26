import 'reflect-metadata';
import test from 'node:test';
import assert from 'node:assert/strict';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/enums/role.enum';
import { F5SafetyController } from './f5-safety.controller';

const guardedEndpoints = [
  F5SafetyController.prototype.listBorrowers,
  F5SafetyController.prototype.listBriefings,
  F5SafetyController.prototype.getStatus,
  F5SafetyController.prototype.recordBriefing,
];

function runRoleGuard(handler: Function, role: Role) {
  const guard = new RolesGuard(new Reflector());
  const context: any = {
    getHandler: () => handler,
    getClass: () => F5SafetyController,
    switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }),
  };
  return guard.canActivate(context);
}

test('R15 allows only desk assistants, managers, and safety officers on safety endpoints', () => {
  const allowed = [Role.DESK_ASSISTANT, Role.MANAGER, Role.SAFETY_OFFICER];
  for (const endpoint of guardedEndpoints) {
    for (const role of allowed) assert.equal(runRoleGuard(endpoint, role), true);
    for (const role of [Role.STUDENT, Role.STAFF, Role.LECTURER]) {
      assert.throws(() => runRoleGuard(endpoint, role), ForbiddenException);
    }
  }
});
