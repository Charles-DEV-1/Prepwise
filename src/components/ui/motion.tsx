"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export const motionTokens = {
  ease,
  micro: 0.16,
  normal: 0.28,
  feedback: 0.42,
};

export function PageTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : motionTokens.normal, ease }}>{children}</motion.div>;
}

export function Stagger({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.055, delayChildren: reduced ? 0 : delay } } }}>{children}</motion.div>;
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} variants={{ hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: reduced ? 0.12 : motionTokens.normal, ease } } }}>{children}</motion.div>;
}

export function AnswerFeedback({ correct, children, className }: { correct: boolean; children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }} animate={correct || reduced ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: [0, -4, 4, -2, 0] }} transition={{ duration: correct ? 0.32 : 0.38, ease }} className={cn("relative overflow-hidden rounded-2xl", className)}>
    {correct && !reduced && <motion.span aria-hidden className="absolute inset-0 rounded-2xl bg-green-300/25" initial={{ opacity: 0.7, scale: 0.8 }} animate={{ opacity: 0, scale: 1.2 }} transition={{ duration: 0.55, ease }} />}
    <div className="relative flex items-start gap-3">{correct ? <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,.28)]"><Check className="h-5 w-5" /></span> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-white"><X className="h-5 w-5" /></span>}{children}</div>
  </motion.div>;
}

export function ExplanationReveal({ children, revealKey }: { children: ReactNode; revealKey: string }) {
  const reduced = useReducedMotion();
  return <motion.div key={revealKey} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0.12 : 0.42, ease }} className="ai-reveal relative overflow-hidden rounded-2xl">
    {!reduced && <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-300/0 via-blue-300/35 to-transparent" initial={{ y: -100, opacity: 0 }} animate={{ y: 180, opacity: [0, 0.9, 0] }} transition={{ duration: 1.3, ease }} />}
    <div className="relative">{children}</div>
  </motion.div>;
}

export function AnimatedNumber({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
    const started = performance.now();
    const duration = 700;
    let frame = 0;
    const tick = (now: number) => { const t = Math.min(1, (now - started) / duration); setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3)))); if (t < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, value]);
  return <span className={className}>{display}{suffix}</span>;
}

export function ScoreRing({ value, className }: { value: number; className?: string }) {
  const reduced = useReducedMotion();
  const radius = 43; const circumference = 2 * Math.PI * radius;
  return <div className={cn("relative grid h-32 w-32 place-items-center", className)}><svg className="absolute -rotate-90" width="128" height="128" viewBox="0 0 100 100" aria-hidden><circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="7" className="text-blue-100" /><motion.circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" className="text-primary" initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference * (1 - value / 100) }} transition={{ duration: reduced ? 0 : 0.9, ease }} /></svg><AnimatedNumber value={value} suffix="%" className="text-3xl font-bold text-navy" /></div>;
}

export function StreakCelebration() {
  const reduced = useReducedMotion(); const [streak, setStreak] = useState<number | null>(null);
  useEffect(() => { const onStreak = (event: Event) => setStreak((event as CustomEvent<{ streak: number }>).detail.streak); window.addEventListener("prepcore:streak-increased", onStreak); return () => window.removeEventListener("prepcore:streak-increased", onStreak); }, []);
  useEffect(() => { if (streak === null) return; const id = window.setTimeout(() => setStreak(null), 3400); return () => window.clearTimeout(id); }, [streak]);
  return <AnimatePresence>{streak !== null && <motion.div role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] grid place-items-center bg-navy/20 p-4 backdrop-blur-sm"><motion.div initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.84, y: 22 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 280, damping: 22 }} className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-orange-200 bg-white p-7 text-center shadow-2xl"><motion.div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,146,60,.22),transparent_52%)]" animate={reduced ? {} : { opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 0.9 }} /><div className="relative"><motion.div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-orange-50 text-5xl shadow-[0_0_0_10px_rgba(254,215,170,.45)]" animate={reduced ? {} : { scale: [1, 1.12, 1], y: [0, -5, 0] }} transition={{ duration: 0.7 }}>🔥</motion.div><p className="mt-5 text-xs font-bold tracking-[.2em] text-orange-600">STREAK EXTENDED</p><AnimatedNumber value={streak} className="mt-1 block text-5xl font-bold text-navy" /><p className="text-sm text-slate-600">day streak — keep the momentum going.</p></div></motion.div></motion.div>}</AnimatePresence>;
}
