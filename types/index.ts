// types/index.ts
export interface User {
  id: string;
  email: string;
  username: string;
  exp: number;
  level?: number;
  created_at: string;
}

export interface Level {
  id: number;
  level_number: number;
  title: string;
  description: string;
  theory_content: string;
  exp_reward: number;
}

export interface UserProgress {
  id: number;
  user_id: string;
  level_id: number;
  completed: boolean;
  completed_at: string | null;
  exp_earned: number;
}

export interface Challenge {
  id: number;
  level_id: number;
  description: string;
  expected_output: string;
  starter_code: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
// Tambahkan type untuk learning paths
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  totalLevels: number;
  completedLevels: number;
  progress: number;
  available: boolean;
}