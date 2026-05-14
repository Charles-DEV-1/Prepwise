export const subjects = ["English", "Mathematics", "Physics", "Chemistry", "Biology", "Economics"];

export const dashboardMetrics = {
  streak: 12,
  averageScore: 78,
  questionsAnswered: 1840,
  examDate: "2026-06-20",
};

export const recentSessions = [
  { subject: "Use of English", score: 82, type: "Practice", time: "Today" },
  { subject: "Physics", score: 68, type: "Mock", time: "Yesterday" },
  { subject: "Biology", score: 74, type: "Practice", time: "2 days ago" },
];

export const weakTopics = [
  { subject: "Physics", topic: "Waves and Optics", accuracy: 42 },
  { subject: "Chemistry", topic: "Organic reactions", accuracy: 48 },
  { subject: "Mathematics", topic: "Trigonometry", accuracy: 51 },
];

export const sampleQuestions = [
  {
    id: "q1",
    subject: "English",
    prompt: "Choose the option nearest in meaning to: The principal was livid.",
    options: ["calm", "furious", "tired", "confused"],
    answer: "furious",
    explanation: "Livid means extremely angry, so furious is the closest meaning.",
  },
  {
    id: "q2",
    subject: "Physics",
    prompt: "The SI unit of electric current is",
    options: ["volt", "ohm", "ampere", "coulomb"],
    answer: "ampere",
    explanation: "Electric current is measured in amperes, symbol A.",
  },
];

export const faqs = [
  {
    question: "Is Prepwise free?",
    answer: "Prepwise is free to start, with optional premium study plans and advanced analytics.",
  },
  {
    question: "Which exams are supported?",
    answer: "The foundation supports JAMB, WAEC, and NECO with subject-based practice and mock exams.",
  },
  {
    question: "Can students use it on phones?",
    answer: "Yes. Prepwise is web-first and mobile-first, built for fast study sessions on any browser.",
  },
];
