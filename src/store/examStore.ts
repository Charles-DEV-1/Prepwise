// Prepcore - JAMB/WAEC exam awareness

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExamType } from "@/types/app";

type ExamState = {
  activeExamType: ExamType;
  setActiveExamType: (type: ExamType) => void;
};

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      activeExamType: "jamb",
      setActiveExamType: (type) => set({ activeExamType: type }),
    }),
    { name: "prepcore-active-exam-type" },
  ),
);
