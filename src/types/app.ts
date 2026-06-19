export type ExamType = "jamb" | "waec";

export type ExamGoal = ExamType[];

export type SessionMode = "practice" | "mock";

export type Question = {
  id: string;
  subject_id?: string;
  subject: string;
  exam_type: ExamType;
  year: number | null;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type User = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  exam_type: ExamType | null;
  exam_goals: ExamGoal | null;
  selected_subjects: string[] | null;
  target_score: number | null;
  exam_date: string | null;
  onboarding_completed: boolean;
  is_pro: boolean;
  plan: string | null;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  created_at: string;
};

export type Session = {
  id: string;
  user_id: string;
  mode: SessionMode;
  score: number | null;
  total_questions: number;
  exam_type: ExamType;
  completed_at: string | null;
  created_at: string;
};

export type Subject = {
  id: string;
  name: string;
  exam_type: ExamType;
  created_at: string;
};

export type OnboardingProfile = {
  examType: ExamType;
  examGoals: ExamGoal;
  subjects: string[];
  targetScore: number;
  examDate: string;
};
