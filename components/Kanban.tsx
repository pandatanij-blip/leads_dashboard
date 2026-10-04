"use client";
import Link from "next/link";
import { useState } from "react";
import { STATUSES, label, inr } from "@/lib/labels";

export type Card = { id: string; businessName: string; industry: string; area: string; phone: string; websiteStatus: string; intent: string; quotedAmount: number; nextFollowUp: string; status: string; person: string };
export default function Kanban({ initial, canWrite }: { initial: Card[]; canWrite: boolean }) {
  const [cards, setCards] = useState(initial); const [msg, setMsg] = useState("");
  async function move(id: string, status: string) {
    const prev = cards; setCards(cards.map((c) => (c.id === id ? { ...c, status } : c)));
    const res = await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!res.ok) { setCards(prev); setMsg((await res.json()).error ?? "Move failed"); } else setMsg(`Moved to ${label(status)}`);
  }
  return (
    <div>
      <p className="mb-2 text-sm text-stone-600">{msg || (canWrite ? "Drag a card to change its stage." : "Read-only view.")}</p>
      <div className="flex items-start gap-3 overflow-x-auto pb-4">
        {STATUSES.map((s) => { const col = cards.filter((c) => c.status === s); return (
          <div key={s} className="w-60 shrink-0 rounded-xl bg-stone-200/60 p-2" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const id = e.dataTransfer.getData("id"); if (canWrite && id) move(id, s); }}>
            <h3 className="px-1 text-sm font-semibold">{label(s)} <span className="badge">{col.length}</span></h3>
            {col.map((c) => (
              <div key={c.id} draggable={canWrite} onDragStart={(e) => e.dataTransfer.setData("id", c.id)} className="card mt-2 cursor-grab p-3 text-xs">
                <Link href={`/leads/${c.id}`} className="text-sm font-semibold">{c.businessName}</Link>
                <p>{c.industry} · {c.area}</p><p>{c.person} · {c.phone}</p>
                <p><span className="badge">{label(c.websiteStatus)}</span> <span className="badge">{label(c.intent)}</span></p>
                <p>{c.quotedAmount ? inr(c.quotedAmount) : ""} {c.nextFollowUp && `· Next ${c.nextFollowUp}`}</p>
                {canWrite && <select className="inp mt-1 md:hidden" value={c.status} onChange={(e) => move(c.id, e.target.value)}>{STATUSES.map((x) => <option key={x} value={x}>{label(x)}</option>)}</select>}
              </div>))}
          </div>); })}
      </div>
    </div>
  );
}
