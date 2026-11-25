// Shared types — mirror the backend schemas. Add fields here via PR.
export type Role = 'STUDENT' | 'STAFF' | 'LECTURER' | 'DESK_ASSISTANT' | 'MANAGER' | 'SAFETY_OFFICER';

export interface User {
  _id: string; universityId: string; fullName: string; email: string;
  role: Role; status: string; safetyCertified: boolean;
}
export interface Equipment {
  _id: string; name: string; category: string; canLeaveMakerspace: boolean;
  requiresSafetyBriefing: boolean; status: 'AVAILABLE' | 'RESERVED' | 'ON_LOAN' | 'RETIRED';
  condition: 'GOOD' | 'DAMAGED' | 'MISSING_PARTS'; location: string; currentHolder?: string | null;
}
