"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { waLink } from "@/lib/labels";

export default function FollowUpButtons({ id, leadId, phone }: { id: string; leadId: string; phone: string }) {
  const r = useRouter(); const [busy, setBusy] = useState(false);
  async function act(action: string, dueAt?: string) {
    setBusy(true); const res = await fetch(`/api/followups/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, dueAt }) });
    setBusy(false); if (res.ok) r.refresh(); else alert((await res.json()).error ?? "Failed");
  }
  return (
    <span className="flex flex-wrap gap-1">
      <button disabled={busy} className="btn !px-2 !py-1" onClick={() => act("complete")}>Complete</button>
      <button disabled={busy} className="btn-g !px-2 !py-1" onClick={() => { const d = prompt("New date (YYYY-MM-DD)"); if (d) act("reschedule", d); }}>Reschedule</button>
      <a className="btn-g !px-2 !py-1" href={`tel:${phone}`}>Call</a>
      <a className="btn-g !px-2 !py-1" href={waLink(phone)} target="_blank">WhatsApp</a>
      <a className="btn-g !px-2 !py-1" href={`/leads/${leadId}`}>Open</a>
    </span>
  );
}
