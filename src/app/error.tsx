"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="max-w-md rounded-xl border bg-card p-8 text-center shadow-soft">
        <h1 className="text-2xl font-semibold text-navy">Something broke</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We could not load this Prepcore view. Try again in a moment.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
