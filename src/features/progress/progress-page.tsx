import { Activity, BarChart3, Flame, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const trend = [42, 48, 56, 61, 58, 66, 72, 78];
const stats = [
  { label: "Total sessions", value: "48", icon: Activity },
  { label: "Best mock", value: "312", icon: Target },
  { label: "Current streak", value: "12", icon: Flame },
  { label: "Avg growth", value: "+18%", icon: BarChart3 },
];

export function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-normal text-navy">Progress analytics</h1>
        <p className="mt-2 text-sm text-slate-600">Score trends, streak activity, topic strength, and total statistics.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border bg-white shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-600">{label}</p>
                <p className="mt-2 text-2xl font-bold text-navy">{value}</p>
              </div>
              <Icon className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        ))}
      </section>
      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Score trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-end gap-3">
            {trend.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-primary" style={{ height: `${value * 2}px` }} />
                <span className="text-xs text-slate-600">W{index + 1}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Streak heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-14 gap-2">
            {Array.from({ length: 70 }, (_, index) => (
              <div
                key={index}
                className="aspect-square rounded-[4px] bg-primary/10"
                style={{ opacity: 0.2 + ((index % 5) + 1) * 0.14 }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
