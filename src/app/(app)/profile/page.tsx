"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  getProfileData,
  updateProfileData,
  type ProfileData,
} from "@/services/api/profile";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState<ProfileData | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const data = await getProfileData();
        setEditData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!editData) return;

    try {
      setIsSaving(true);
      await updateProfileData(editData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-2xl border-border bg-white shadow-sm">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl border-border bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Profile settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={editData?.full_name || ""}
            onChange={(e) =>
              setEditData((prev) =>
                prev ? { ...prev, full_name: e.target.value } : null,
              )
            }
            placeholder="Enter your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="examType">Exam type</Label>
          <Input
            id="examType"
            value={editData?.exam_type || ""}
            onChange={(e) =>
              setEditData((prev) =>
                prev ? { ...prev, exam_type: e.target.value } : null,
              )
            }
            placeholder="e.g., JAMB"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetScore">Target score</Label>
          <Input
            id="targetScore"
            type="number"
            value={editData?.target_score || ""}
            onChange={(e) =>
              setEditData((prev) =>
                prev
                  ? { ...prev, target_score: parseInt(e.target.value) || 0 }
                  : null,
              )
            }
            placeholder="e.g., 280"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={editData?.email || ""}
            disabled
            placeholder="Your email"
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </CardContent>
    </Card>
  );
}
