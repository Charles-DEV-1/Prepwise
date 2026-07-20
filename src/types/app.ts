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

// Prepcore — User Referral System
export type UserReferralCode = { id: string; user_id: string; code: string; created_at: string };
export type UserReferralSignup = { id: string; referrer_id: string; referee_id: string; code: string; signed_up_at: string; converted_to_pro: boolean; converted_at: string | null };
export type UserReferralReward = { id: string; user_id: string; reward_batch: number; pro_granted: boolean; pro_granted_at: string | null; cash_claimed: boolean; cash_claim_requested_at: string | null; bank_name: string | null; account_number: string | null; account_name: string | null; admin_paid: boolean; admin_paid_at: string | null; notification_sent: boolean; created_at: string };
