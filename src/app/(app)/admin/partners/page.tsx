"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type ReferralCodeRow = {
  id: string;
  code: string;
  is_active: boolean;
  use_count: number;
  max_uses: number | null;
};

type PartnerRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  is_active: boolean;
  signups: number;
  pro_conversions: number;
  referral_codes: ReferralCodeRow[];
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [slug, setSlug] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [codePartnerId, setCodePartnerId] = useState("");
  const [newCode, setNewCode] = useState("");
  const [codeLabel, setCodeLabel] = useState("");

  const loadPartners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/partners");
      if (!res.ok) throw new Error("Failed to load partners");
      const json = await res.json();
      setPartners(json.partners ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPartners();
  }, [loadPartners]);

  async function createPartner(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || undefined,
          city: city || null,
          contact_name: contactName || null,
          contact_phone: contactPhone || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create partner");
      setName("");
      setCity("");
      setSlug("");
      setContactName("");
      setContactPhone("");
      await loadPartners();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function createCode(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/referral-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_id: codePartnerId,
          code: newCode,
          label: codeLabel || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create code");
      setNewCode("");
      setCodeLabel("");
      await loadPartners();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create code");
    } finally {
      setSaving(false);
    }
  }

  const signupBase =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=`
      : "/signup?ref=";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Lesson center partners</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create partners and referral codes for lesson center partnerships.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Add partner</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => void createPartner(e)}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Center name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bright Future Academy"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="bright-future-abuja"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact name</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="contactPhone">Contact phone</Label>
              <Input
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="sm:col-span-2 w-full sm:w-auto"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create partner
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Generate referral code</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => void createCode(e)}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="codePartner">Partner</Label>
              <select
                id="codePartner"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={codePartnerId}
                onChange={(e) => setCodePartnerId(e.target.value)}
                required
              >
                <option value="">Select a partner</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCode">Code</Label>
              <Input
                id="newCode"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="LAGOS-JAMB"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeLabel">Label (optional)</Label>
              <Input
                id="codeLabel"
                value={codeLabel}
                onChange={(e) => setCodeLabel(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={saving || !codePartnerId}>
              Add code
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {partners.map((partner) => (
            <Card key={partner.id} className="border-border bg-white shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-navy">{partner.name}</h2>
                    <p className="text-xs text-slate-500">
                      {partner.slug}
                      {partner.city ? ` · ${partner.city}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      className={
                        partner.is_active
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }
                    >
                      {partner.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge className="border-border bg-white text-slate-600">
                      {partner.signups} signups
                    </Badge>
                    <Badge className="border-border bg-white text-slate-600">
                      {partner.pro_conversions} Pro
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Referral codes
                  </p>
                  {partner.referral_codes?.length ? (
                    partner.referral_codes.map((code) => (
                      <div
                        key={code.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-[#F8FAFC] p-3 text-sm"
                      >
                        <div>
                          <span className="font-mono font-semibold text-navy">
                            {code.code}
                          </span>
                          <span className="text-slate-500 ml-2">
                            {code.use_count} uses
                            {code.max_uses != null ? ` / ${code.max_uses}` : ""}
                          </span>
                        </div>
                        <a
                          href={`${signupBase}${code.code}`}
                          className="inline-flex items-center gap-1 text-primary text-xs font-medium"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Link2 className="h-3 w-3" />
                          Share link
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No codes yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {partners.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-8">
              No partners yet. Create your first lesson center above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
