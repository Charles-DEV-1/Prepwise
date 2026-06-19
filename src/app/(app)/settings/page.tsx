import { Bell, Moon, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const settings = [
    {
      title: "Study reminders",
      body: "Daily nudges for streaks and mock exam targets.",
      icon: Bell,
    },
    {
      title: "Appearance",
      body: "Light-first interface with accessible contrast.",
      icon: Moon,
    },
    {
      title: "Security",
      body: "Session and account protection settings.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-normal text-navy">
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your Prepcore study experience.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {settings.map((item) => (
          <Card key={item.title} className="border-border bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-softblue text-primary">
                <item.icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-bold text-navy">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {[
            "Daily study reminder",
            "Mock exam summary",
            "Weak-topic alerts",
            "Leaderboard movement",
          ].map((item) => (
            <label
              key={item}
              className="flex items-center gap-3 rounded-2xl border border-border p-4 text-sm font-medium text-slate-600"
            >
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-[#2563EB]"
              />
              {item}
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
