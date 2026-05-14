import { Activity, BookOpenCheck, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  const metrics = [
    { label: "Active students", value: "2,840", icon: Users },
    { label: "Questions answered", value: "184k", icon: BookOpenCheck },
    { label: "Avg improvement", value: "+18%", icon: TrendingUp },
    { label: "Sessions today", value: "912", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-normal text-navy">Admin analytics</h1>
        <p className="mt-2 text-sm text-slate-600">Lightweight operational view of student activity and content performance.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-border bg-white shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-bold text-navy">{metric.value}</p>
              </div>
              <metric.icon className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Weekly study activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-end gap-3">
            {[45, 58, 63, 71, 67, 82, 88].map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-2xl bg-gradient-to-t from-primary to-blue-300" style={{ height: `${value * 2}px` }} />
                <span className="text-xs text-slate-500">D{index + 1}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
