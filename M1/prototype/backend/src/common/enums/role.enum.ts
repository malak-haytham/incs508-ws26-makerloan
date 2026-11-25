export enum Role {
  STUDENT = 'STUDENT',
  STAFF = 'STAFF',
  LECTURER = 'LECTURER',
  DESK_ASSISTANT = 'DESK_ASSISTANT',
  MANAGER = 'MANAGER',
  SAFETY_OFFICER = 'SAFETY_OFFICER',
}

/** Roles that borrow equipment. */
export const BORROWER_ROLES = [Role.STUDENT, Role.STAFF, Role.LECTURER];
