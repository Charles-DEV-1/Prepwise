import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="brand-blue-surface">
        <section className="container grid min-h-[calc(100vh-4rem)] items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Image
              src="/favicons/android-chrome-512x512.png"
              alt="Prepcore logo"
              width={88}
              height={88}
              className="rounded-full"
            />
            <h1 className="mt-6 max-w-2xl text-5xl font-bold leading-tight tracking-normal text-navy">
              Be first when Prepcore opens to students.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
              Join the early access list for AI explanations, mock exams,
              analytics, and personalized learning plans.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Free to join",
                "Mobile-first study experience",
                "Built for JAMB, WAEC, and NECO",
              ].map((item) => (
                <p
                  key={item}
                  className="flex items-center gap-3 text-sm font-medium text-slate-600"
                >
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <Card className="soft-card">
            <CardHeader>
              <CardTitle>Join the waitlist</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input type="text" placeholder="Full name" />
                <Input type="email" placeholder="Email address" />
                <Input type="tel" placeholder="Phone number" />
                <Button className="w-full" size="lg">
                  <Mail className="h-4 w-4" />
                  Join Waitlist
                </Button>
              </form>
              <Button asChild variant="ghost" className="mt-4 w-full">
                <Link href="/signup">
                  Create account instead <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
