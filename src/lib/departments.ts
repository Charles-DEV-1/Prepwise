// Prepcore - Free Diagnostic Test

export type Department = "science" | "arts" | "commercial";

export const DEPARTMENT_SUBJECTS: Record<Department, string[]> = {
  science: ["English Language", "Mathematics", "Physics", "Chemistry"],
  arts: ["English Language", "Literature in English", "Government", "Christian Religious Studies"],
  commercial: ["English Language", "Mathematics", "Economics", "Government"],
};

export const DEPARTMENT_LABELS: Record<Department, string> = {
  science: "Science",
  arts: "Arts",
  commercial: "Commercial",
};

export function isDepartment(value: string | null): value is Department {
  return value === "science" || value === "arts" || value === "commercial";
}