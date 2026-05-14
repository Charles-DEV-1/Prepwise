import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function QuestionUploadPage() {
  return (
    <Card className="max-w-3xl border-border bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Question upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Exam type</Label>
            <Input placeholder="JAMB" />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input placeholder="Physics" />
          </div>
        </div>
        <div className="rounded-3xl border border-dashed border-blue-200 bg-softblue p-8 text-center">
          <UploadCloud className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 font-semibold text-navy">Upload CSV or JSON question set</p>
          <p className="mt-1 text-sm text-slate-600">Questions, options, answers, topics, years, and explanations.</p>
          <Button className="mt-5">Choose file</Button>
        </div>
      </CardContent>
    </Card>
  );
}
