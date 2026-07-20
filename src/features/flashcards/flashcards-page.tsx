"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Lock, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/services/supabase/client";
import { useUserPlan } from "@/hooks/use-user-plan";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Flashcard = {
  id: string;
  front: string;
  back: string;
  is_premium: boolean;
};

export function FlashcardsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { isPro, isLoading } = useUserPlan();

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const card = flashcards[index];

  useEffect(() => {
    if (isLoading) return;
    if (!isPro) {
      setLoading(false);
      return;
    }

    async function loadFlashcards() {
      setLoading(true);
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .order("created_at");
      if (!error && data) setFlashcards(data);
      setLoading(false);
    }

    loadFlashcards();
  }, [isPro, isLoading, supabase]);

  function nextCard() {
    setFlipped(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1 >= flashcards.length ? 0 : prev + 1));
    }, 200);
  }

  function prevCard() {
    setFlipped(false);
    setTimeout(() => {
      setIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
    }, 200);
  }

  // Plan still loading
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  // Not pro — show full gate
  if (!isPro) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy">Flashcards</h1>
            <p className="mt-2 text-sm text-slate-600">
              Swipe, flip, and memorize concepts faster.
            </p>
          </div>
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            <Sparkles className="mr-1 h-3 w-3" />
            PRO FEATURE
          </Badge>
        </div>

        {/* Blurred preview */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="pointer-events-none select-none blur-md opacity-30">
            <div className="mx-auto max-w-2xl">
              <div className="relative h-[440px] w-full">
                <div className="absolute inset-0 translate-y-4 scale-95 rounded-3xl bg-primary/5" />
                <div className="absolute inset-0 translate-y-2 scale-[0.97] rounded-3xl bg-primary/10" />
                <Card className="h-full rounded-3xl border-border bg-white shadow-xl">
                  <CardContent className="flex h-full flex-col justify-between p-8">
                    <Badge className="bg-primary/10 text-primary w-fit">
                      Flashcard
                    </Badge>
                    <div className="flex flex-1 items-center justify-center">
                      <h2 className="text-center text-3xl font-bold text-navy">
                        What is Avogadro&apos;s Number?
                      </h2>
                    </div>
                    <p className="text-center text-sm text-slate-500">
                      Tap to reveal answer
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-white/70 backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-softblue">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center px-4">
              <p className="text-xl font-bold text-navy">
                Flashcards are Pro only
              </p>
              <p className="mt-2 text-sm text-slate-500 max-w-sm">
                Unlock all flashcard decks for English, Maths, Physics,
                Chemistry, Biology, and Economics. Flip cards, track what you
                know, focus on what you don&apos;t.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/upgrade">
                <Sparkles className="h-4 w-4" />
                Upgrade to Pro — ₦3,000
              </Link>
            </Button>
            <p className="text-xs text-slate-400">
              One-time payment · Access until after JAMB
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pro user — loading cards
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading flashcards...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">
          No flashcards found. Check your database.
        </p>
      </div>
    );
  }

  // Pro user — full flashcard experience
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Flashcards</h1>
          <p className="mt-2 text-sm text-slate-600">
            Swipe, flip, and memorize concepts faster.
          </p>
        </div>
        <Badge className="border-green-200 bg-green-50 text-green-700">
          <Sparkles className="mr-1 h-3 w-3" />
          PRO — {flashcards.length} cards
        </Badge>
      </div>

      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -100) nextCard();
              if (info.offset.x > 100) prevCard();
            }}
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -30 }}
            transition={{ duration: 0.35 }}
            className="relative h-[440px] w-full cursor-pointer"
            style={{ perspective: "1000px" }}
            onClick={() => setFlipped(!flipped)}
          >
            <div className="absolute inset-0 translate-y-4 scale-95 rounded-3xl bg-primary/5" />
            <div className="absolute inset-0 translate-y-2 scale-[0.97] rounded-3xl bg-primary/10" />

            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              className="relative h-full w-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front */}
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden" }}
              >
                <Card className="h-full rounded-3xl border-border bg-white shadow-xl">
                  <CardContent className="flex h-full flex-col justify-between p-8">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/10 text-primary">
                        {index + 1} / {flashcards.length}
                      </Badge>
                      <RotateCcw className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                      <h2 className="text-center text-3xl font-bold leading-snug text-navy">
                        {card.front}
                      </h2>
                    </div>
                    <p className="text-center text-sm text-slate-500">
                      Tap to reveal answer
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <Card className="h-full rounded-3xl border-primary/20 bg-primary shadow-2xl">
                  <CardContent className="flex h-full flex-col justify-between p-8 text-white">
                    <Badge className="w-fit bg-white/20 text-white">
                      Answer
                    </Badge>
                    <div className="flex flex-1 items-center justify-center">
                      <p className="text-center text-2xl leading-relaxed">
                        {card.back}
                      </p>
                    </div>
                    <p className="text-center text-sm text-blue-100">
                      Tap again to flip back
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" onClick={prevCard}>
            Previous
          </Button>
          <Button variant="outline" onClick={nextCard}>
            Review Again
          </Button>
          <Button onClick={nextCard} className="gap-2">
            Got It <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Swipe left or right to navigate · {index + 1} of {flashcards.length}
        </p>
      </div>
    </div>
  );
}
