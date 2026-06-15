export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  specialisation: string;
  experience: string;
  email: string;
  linkedin: string;
  created_at: string;
  updated_at: string;
}

export type TeamMemberCreate = Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>;
export type TeamMemberUpdate = Partial<TeamMemberCreate>;
