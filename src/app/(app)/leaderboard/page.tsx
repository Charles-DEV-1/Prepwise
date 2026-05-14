import { Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LeaderboardPage() {
  const students = ["Adaeze O.", "Precious O.", "Emmanuel M.", "Fatima K.", "Chinedu A."];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {students.map((student, index) => (
          <div key={student} className="flex items-center justify-between rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <Medal className="h-5 w-5 text-amber" />
              <div>
                <p className="font-medium text-navy">{student}</p>
                <p className="text-xs text-muted-foreground">{320 - index * 9} mock score</p>
              </div>
            </div>
            <Badge className="border-primary/20 bg-primary/10 text-primary">#{index + 1}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
