// types/project.ts
export interface Project {
  id: number;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: number[];
  skills: string[];
  features: string[];
  starterCode: {
    html: string;
    css: string;
    js: string;
  };
  expectedOutput: string;
  learningObjectives: string[];
}

export interface ProjectProgress {
  projectId: number;
  completed: boolean;
  completedAt?: string;
  code?: {
    html: string;
    css: string;
    js: string;
  };
}