"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Screen = "form" | "success";

export function FeedbackPrompt() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [screen, setScreen] = useState<Screen>("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const idempotencyKey = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/feedback/eligibility", { cache: "no-store" });
        const result = await response.json() as { eligible?: boolean };
        if (!cancelled && response.ok && result.eligible) setOpen(true);
      } catch {
        // Feedback must never interrupt dashboard use when its check is unavailable.
      }
    }, 1200);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (screen !== "success") return;
    const timer = window.setTimeout(() => setOpen(false), 2600);
    return () => window.clearTimeout(timer);
  }, [screen]);

  async function postpone() {
    setOpen(false);
    try { await fetch("/api/feedback/postpone", { method: "POST" }); } catch { /* no visual interruption */ }
  }

  async function submit() {
    if (!rating) { setError("Choose a star rating before sending your feedback."); return; }
    setSubmitting(true); setError("");
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, idempotencyKey: idempotencyKey.current }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "We couldn't send your feedback. Please try again.");
      setScreen("success");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't send your feedback. Please try again.");
    } finally { setSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && screen === "form") void postpone(); else setOpen(next); }}>
      <DialogContent className="max-w-xl overflow-hidden border-blue-100 p-0" aria-describedby="feedback-description">
        <AnimatePresence mode="wait">
          {screen === "success" ? (
            <motion.div key="success" initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden p-8 text-center sm:p-10">
              <motion.div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,.16),transparent_58%)]" />
              <div className="relative">
                <motion.div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600 shadow-[0_0_0_12px_rgba(209,250,229,.8)]" initial={reduced ? false : { scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}><Check className="h-10 w-10" strokeWidth={3} /></motion.div>
                <h2 className="mt-7 text-2xl font-bold text-navy">Thanks for helping us improve Prepcore.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">Your feedback has been received.</p>
                <Button className="mt-7" onClick={() => setOpen(false)}>Done</Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="p-6 sm:p-8">
              <DialogHeader><DialogTitle className="text-2xl text-navy">How&apos;s Prepcore going for you?</DialogTitle><DialogDescription id="feedback-description" className="leading-6">You&apos;ve been using Prepcore for a little while, and we&apos;d love to know what you think.</DialogDescription></DialogHeader>
              <div className="mt-7"><p className="text-sm font-semibold text-navy">How would you rate your experience?</p><div className="mt-3 flex gap-1" role="radiogroup" aria-label="Your rating">{[1, 2, 3, 4, 5].map((value) => { const active = value <= (hoveredRating || rating); return <motion.button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value === 1 ? "" : "s"}`} onMouseEnter={() => setHoveredRating(value)} onMouseLeave={() => setHoveredRating(0)} onFocus={() => setHoveredRating(value)} onBlur={() => setHoveredRating(0)} onClick={() => { setRating(value); setError(""); }} whileTap={reduced ? {} : { scale: 0.9 }} className="grid h-11 w-11 place-items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Star className={cn("h-8 w-8 transition-all", active ? "fill-amber text-amber drop-shadow-[0_2px_5px_rgba(245,158,11,.35)]" : "text-slate-300")} /></motion.button>; })}</div></div>
              <div className="mt-6"><label htmlFor="feedback-comment" className="text-sm font-semibold text-navy">What should we improve? <span className="font-normal text-slate-500">(optional)</span></label><textarea id="feedback-comment" value={comment} maxLength={4000} onChange={(event) => setComment(event.target.value)} placeholder="Tell us what you’d like us to improve, change, or add..." className="mt-3 min-h-28 w-full resize-y rounded-2xl border border-border bg-slate-50 p-4 text-sm text-navy outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15" /></div>
              {error && <motion.p role="alert" initial={reduced ? false : { opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="mt-3 text-sm font-medium text-destructive">{error}</motion.p>}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="ghost" onClick={() => void postpone()} disabled={submitting}>Maybe later</Button><Button onClick={() => void submit()} disabled={submitting}>{submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Sending feedback</> : "Send Feedback"}</Button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
