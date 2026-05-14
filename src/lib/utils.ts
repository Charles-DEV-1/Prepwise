import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}

export function daysUntil(date: string) {
  const target = new Date(date).getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target - today) / 86_400_000));
}
