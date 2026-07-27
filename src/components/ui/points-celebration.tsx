"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";

type PointsEvent = { points: number; rankUp?: { previous: string; next: string; emoji: string } };

export function PointsCelebration() {
  const [event, setEvent] = useState<PointsEvent | null>(null);

  useEffect(() => {
    const handle = (incoming: Event) => {
      setEvent((incoming as CustomEvent<PointsEvent>).detail);
    };
    window.addEventListener("prepcore:points-awarded", handle);
    return () => window.removeEventListener("prepcore:points-awarded", handle);
  }, []);

  useEffect(() => {
    if (!event) return;
    const timeout = window.setTimeout(() => setEvent(null), event.rankUp ? 4200 : 2400);
    return () => window.clearTimeout(timeout);
  }, [event]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          className="fixed bottom-5 left-1/2 z-[80] w-[min(23rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-primary/20 bg-white p-4 shadow-2xl"
          role="status"
        >
          {event.rankUp ? (
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.22, 1] }}
                transition={{ duration: 0.7 }}
                className="text-4xl"
              >
                {event.rankUp.emoji}
              </motion.div>
              <p className="mt-2 font-bold text-navy">Rank up! You&apos;re now {event.rankUp.next}.</p>
              <p className="mt-1 text-sm text-slate-500">+{event.points} points earned</p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div><p className="font-bold text-navy">+{event.points} points</p><p className="text-sm text-slate-500">Great work—keep learning.</p></div>
              <Trophy className="ml-auto h-5 w-5 text-amber" />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
