import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <Card className="max-w-2xl border-border bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Profile settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Full name</Label>
          <Input defaultValue="Precious O." />
        </div>
        <div className="space-y-2">
          <Label>Exam type</Label>
          <Input defaultValue="JAMB" />
        </div>
        <div className="space-y-2">
          <Label>Target score</Label>
          <Input defaultValue="280" />
        </div>
        <Button>Save changes</Button>
      </CardContent>
    </Card>
  );
}
