export type ExamType = "JAMB" | "WAEC" | "NECO";

export type SessionMode = "practice" | "mock";

export type Question = {
  id: string;
  subject: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type OnboardingProfile = {
  examType: ExamType;
  subjects: string[];
  targetScore: number;
  examDate: string;
};
