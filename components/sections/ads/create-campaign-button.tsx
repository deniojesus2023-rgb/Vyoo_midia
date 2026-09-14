"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import CampaignBuilder from "@/components/campaign-builder";
import type { State } from "@/lib/model";

export default function CreateCampaignButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<State | null>(null);
  const [loading, setLoading] = useState(false);

  const openBuilder = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/state");
      const j = await r.json();
      if (r.ok) {
        setData(j.state);
        setOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const act = async (
    action: string,
    payload: Record<string, unknown> = {},
    options: { keepModal?: boolean } = {},
  ) => {
    const r = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });
    const j = await r.json();
    if (!r.ok) return false;
    setData(j.state);
    if (!options.keepModal) {
      setOpen(false);
      router.refresh();
    }
    return true;
  };

  return (
    <>
      <button className="vy-button" onClick={openBuilder} disabled={loading}>
        <Plus /> {loading ? "Carregando..." : "Criar campanha"}
      </button>
      {open && data && (
        <div className="vy-dialog-backdrop" style={{ padding: 0 }}>
          <div style={{ width: "100%", height: "100%", overflow: "auto", background: "var(--canvas,#f4f6f7)" }}>
            <CampaignBuilder data={data} act={act} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
