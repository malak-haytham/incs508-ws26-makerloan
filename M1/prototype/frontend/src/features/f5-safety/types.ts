export type Borrower = { _id: string; fullName: string; email: string; safetyCertified: boolean };

export type Briefing = {
  _id: string;
  briefedAt: string;
  user?: { _id: string; fullName: string; email: string; safetyCertified: boolean };
  recordedBy?: { fullName: string; role: string };
};
