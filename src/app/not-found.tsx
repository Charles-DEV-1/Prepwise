import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="max-w-md rounded-xl border bg-card p-8 text-center shadow-soft">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-navy">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This route is not part of the current Prepcore workspace.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
