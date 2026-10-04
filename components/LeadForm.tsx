"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { INTENTS, WEBSITE, label } from "@/lib/labels";

type Opt = { id: string; name: string };
export default function LeadForm({ industries, sources, open }: { industries: Opt[]; sources: Opt[]; open?: boolean }) {
  const r = useRouter(); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  async function send(body: Record<string, FormDataEntryValue>, force = false) {
    setBusy(true); setMsg("");
    const res = await fetch("/api/leads" + (force ? "?force=1" : ""), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json(); setBusy(false);
    if (res.status === 409) {
      if (confirm(`Possible duplicate lead: ${j.duplicate.businessName}. Create anyway?`)) return send(body, true);
      return;
    }
    if (!res.ok) return setMsg(j.error || "Could not save lead");
    setMsg("Lead added"); r.refresh(); (document.getElementById("lf") as HTMLFormElement).reset();
  }
  return (
    <details open={open} className="card mb-4">
      <summary className="cursor-pointer font-semibold">+ Add lead</summary>
      <form id="lf" className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(e) => { e.preventDefault(); send(Object.fromEntries(new FormData(e.currentTarget))); }}>
        <input name="businessName" required placeholder="Business name *" className="inp" />
        <input name="contactPerson" placeholder="Contact person" className="inp" />
        <input name="phone" required placeholder="Phone *" className="inp" />
        <input name="email" type="email" placeholder="Email" className="inp" />
        <select name="industryId" className="inp"><option value="">Industry</option>{industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
        <input name="area" placeholder="Area (e.g. Sector 15)" className="inp" />
        <input name="city" defaultValue="Faridabad" className="inp" />
        <input name="website" placeholder="Website URL" className="inp" />
        <select name="websiteStatus" defaultValue="UNKNOWN" className="inp">{WEBSITE.map((w) => <option key={w} value={w}>{label(w)}</option>)}</select>
        <select name="intent" defaultValue="UNVERIFIED" className="inp">{INTENTS.map((w) => <option key={w} value={w}>{label(w)}</option>)}</select>
        <select name="sourceId" className="inp"><option value="">Lead source</option>{sources.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
        <input name="intentSignal" placeholder="Public intent signal" className="inp" />
        <input name="quotedAmount" type="number" min="0" placeholder="Quoted ₹" className="inp" />
        <input name="nextFollowUp" type="date" className="inp" />
        <input name="notes" placeholder="Notes" className="inp sm:col-span-2" />
        <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4"><button className="btn" disabled={busy}>{busy ? "Saving…" : "Save lead"}</button><span className="text-sm text-stone-600">{msg}</span></div>
      </form>
    </details>
  );
}
