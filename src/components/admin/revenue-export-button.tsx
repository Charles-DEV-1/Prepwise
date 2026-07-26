// Prepcore — Revenue Dashboard
"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RevenueExportButton() {
  const [loading, setLoading] = useState(false);
  async function download() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/revenue/export");
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "prepcore-revenue.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  }
  return <Button variant="outline" className="mt-4" disabled={loading} onClick={() => void download()}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Download CSV</Button>;
}
