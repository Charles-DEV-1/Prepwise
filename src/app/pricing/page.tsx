import Link from "next/link";
import { Check } from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    price: "Free",
    items: ["Past questions", "Basic mock exams", "Starter progress tracking"],
  },
  {
    name: "Prepcore Pro",
    price: "Coming soon",
    items: [
      "AI explanations",
      "Personalized study plans",
      "Weak-topic analytics",
      "Leaderboard boosts",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="brand-blue-surface py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-5xl font-bold tracking-normal text-navy">
              Simple pricing for ambitious students.
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Start free and upgrade when you need deeper AI guidance.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.name.includes("Pro")
                    ? "soft-card border-primary"
                    : "soft-card"
                }
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-3xl font-bold text-primary">
                    {plan.price}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {plan.items.map((item) => (
                      <p
                        key={item}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <Check className="h-4 w-4 text-success" />
                        {item}
                      </p>
                    ))}
                  </div>
                  <Button asChild className="mt-6 w-full">
                    <Link href="/waitlist">Join Waitlist</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
