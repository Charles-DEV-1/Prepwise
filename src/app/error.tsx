"use client";

import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const reducedMotion = useReducedMotion();
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <motion.div initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, x: -3 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: [0, 3, -2, 0] }} transition={{ duration: reducedMotion ? 0.12 : 0.36 }} className="max-w-md rounded-xl border bg-card p-8 text-center shadow-soft">
        <h1 className="text-2xl font-semibold text-navy">Something broke</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We could not load this Prepcore view. Try again in a moment.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </motion.div>
    </main>
  );
}
