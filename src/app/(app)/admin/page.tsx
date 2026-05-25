import { Database, FileQuestion, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const adminMetrics = [
  { label: "Users", value: "2,840", icon: Users },
  { label: "Questions", value: "10,240", icon: FileQuestion },
  { label: "Sessions", value: "18,902", icon: Database },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-normal text-navy">
          Admin dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Operational overview for content, users, sessions, and subscriptions.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {adminMetrics.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border bg-white shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold text-navy">{value}</p>
              </div>
              <Icon className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-bold text-navy">Lesson center partners</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Manage partners, referral codes, and signup links for
              partnerships.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/admin/partners">Manage partners</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/referrals">View referrals</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-bold text-navy">Question operations</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Upload, review, and publish new exam question sets.
            </p>
            <Button asChild className="mt-5">
              <Link href="/admin/question-upload">Open uploader</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-bold text-navy">Analytics</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review student activity, subject performance, and platform growth.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link href="/admin/analytics">View analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Content queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Import 2025 JAMB Physics",
            "Review WAEC Biology explanations",
            "Publish NECO Chemistry set",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-border bg-[#F8FAFC] p-3 text-sm text-slate-600"
            >
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
