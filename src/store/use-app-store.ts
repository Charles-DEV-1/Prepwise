import { create } from "zustand";
import type { Question } from "@/types/app";
export { useExamStore } from "@/store/examStore";

type AppState = {
  activeQuestionIndex: number;
  flaggedQuestionIds: string[];
  selectedAnswers: Record<string, string>;
  setActiveQuestionIndex: (index: number) => void;
  toggleFlag: (questionId: string) => void;
  answerQuestion: (question: Question, answer: string) => void;
  resetExam: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeQuestionIndex: 0,
  flaggedQuestionIds: [],
  selectedAnswers: {},
  setActiveQuestionIndex: (index) => set({ activeQuestionIndex: index }),
  toggleFlag: (questionId) =>
    set((state) => ({
      flaggedQuestionIds: state.flaggedQuestionIds.includes(questionId)
        ? state.flaggedQuestionIds.filter((id) => id !== questionId)
        : [...state.flaggedQuestionIds, questionId],
    })),
  answerQuestion: (question, answer) =>
    set((state) => ({
      selectedAnswers: { ...state.selectedAnswers, [question.id]: answer },
    })),
  resetExam: () =>
    set({
      activeQuestionIndex: 0,
      flaggedQuestionIds: [],
      selectedAnswers: {},
    }),
}));
