import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  { plan: "Free", price: "NGN 0", items: ["Practice questions", "Basic mock exams", "Starter analytics"] },
  {
    plan: "Pro",
    price: "NGN 2,500/mo",
    items: ["AI explanations", "Personalized study plans", "Advanced weak-topic analytics"],
  },
];

export default function UpgradePage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {plans.map(({ plan, price, items }) => (
        <Card key={plan} className={plan === "Pro" ? "border-primary bg-softblue shadow-soft" : "border-border bg-white shadow-sm"}>
          <CardHeader>
            <CardTitle>{plan}</CardTitle>
            <p className="text-3xl font-bold text-navy">{price}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="h-4 w-4 text-success" /> {item}
                </p>
              ))}
            </div>
            <Button className="mt-6 w-full" variant={plan === "Pro" ? "default" : "outline"}>Choose {plan}</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
