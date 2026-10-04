"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUSES, label, waLink } from "@/lib/labels";

export default function LeadActions({ id, phone, status, name, canWrite, techNotes }: { id: string; phone: string; status: string; name: string; canWrite: boolean; techNotes: string }) {
  const r = useRouter(); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function call(url: string, method: string, body: unknown, ok: string) {
    setBusy(true); const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({})); setBusy(false);
    setMsg(res.ok ? ok : j.error || "Could not save"); if (res.ok) r.refresh(); return res.ok;
  }
  const log = (type: string, content: string, extra: object = {}) => call(`/api/leads/${id}/activities`, "POST", { type, content, ...extra }, "Saved");
  function whatsapp() {
    const m = prompt("Edit the message, then OK to open WhatsApp. Nothing is sent until you press send there.", `Hello, this is Shubham from WEBX – Digital Solutions. We build websites for local businesses like ${name}. Can I share a quick idea?`);
    if (m === null) return; window.open(waLink(phone, m), "_blank"); log("WHATSAPP", "Message opened in WhatsApp");
  }
  if (!canWrite) return (
    <form className="card space-y-2" onSubmit={(e) => { e.preventDefault(); call(`/api/leads/${id}`, "PATCH", { techNotes: new FormData(e.currentTarget).get("t") }, "Technical notes saved"); }}>
      <b>Technical notes</b><textarea name="t" defaultValue={techNotes} rows={4} className="inp" /><button className="btn" disabled={busy}>Save notes</button><p className="text-sm">{msg}</p></form>);
  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap gap-2">
        <a className="btn" href={`tel:${phone}`} onClick={() => log("CALL", "Call placed")}>Call</a>
        <button className="btn-g" onClick={whatsapp}>WhatsApp</button>
        <select className="inp w-auto" value={status} disabled={busy} onChange={(e) => call(`/api/leads/${id}`, "PATCH", { status: e.target.value }, "Status updated")}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
      </div>
      <form className="grid gap-2 sm:grid-cols-[1fr_auto_auto]" onSubmit={async (e) => { e.preventDefault(); const f = e.currentTarget; const d = new FormData(f); if (await log("NOTE", String(d.get("c")), { followUpAt: d.get("fu") })) f.reset(); }}>
        <input name="c" required placeholder="Add a note…" className="inp" /><input name="fu" type="date" className="inp" title="Next follow-up" /><button className="btn" disabled={busy}>Save</button></form>
      <p className="text-sm text-stone-600">{msg}</p>
    </div>
  );
}
