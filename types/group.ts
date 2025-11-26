// types/group.ts
export interface Group {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  teacherId: string;
  createdAt: string;
  members: GroupMember[];
  challenges: GroupChallenge[];
}

export interface GroupMember {
  userId: string;
  username: string;
  joinedAt: string;
  role: 'student' | 'assistant' | 'teacher';
}

export interface GroupChallenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  levelId: number;
  rewards: {
    exp: number;
    badge?: string;
  };
  submissions: ChallengeSubmission[];
}

export interface ChallengeSubmission {
  userId: string;
  username: string;
  code: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
}