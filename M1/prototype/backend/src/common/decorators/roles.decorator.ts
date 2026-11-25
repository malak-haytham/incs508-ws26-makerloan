import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';
export const ROLES_KEY = 'roles';
/** Restrict a route to the listed roles (enforced by the global RolesGuard). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
