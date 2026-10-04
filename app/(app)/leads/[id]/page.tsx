import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser, canWrite } from "@/lib/auth";
import { heat } from "@/lib/score";
import { inr, label } from "@/lib/labels";
import LeadActions from "@/components/LeadActions";
export const dynamic = "force-dynamic";

export default async function LeadPage({ params }: { params: { id: string } }) {
  const u = await currentUser();
  const l = await prisma.lead.findUnique({ where: { id: params.id }, include: { industry: true, source: true, assignedTo: true, package: true, activities: { orderBy: { createdAt: "desc" }, include: { user: true } } } });
  if (!l) notFound();
  const rows: [string, string][] = [["Industry", l.industry?.name ?? "–"], ["Location", [l.area, l.city].filter(Boolean).join(", ")], ["Contact", l.contactPerson ?? "–"], ["Phone", l.phone], ["Email", l.email ?? "–"], ["Website", l.website ?? "–"], ["Website status", label(l.websiteStatus)], ["Intent", label(l.intent)], ["Public intent signal", l.intentSignal ?? "–"], ["Source", l.source?.name ?? "–"], ["Package", l.package?.name ?? "–"], ["Quote", l.quotedAmount ? inr(l.quotedAmount) : "–"], ["Probability", l.probability + "%"], ["Expected value", inr((l.quotedAmount * l.probability) / 100)], ["Assigned to", l.assignedTo?.name ?? "–"]];
  return (
    <div className="space-y-4">
      <Link href="/leads" className="text-sm text-stone-500">← Leads</Link>
      <h1 className="text-2xl font-bold">{l.businessName} {l.isDemo && <span className="badge">DEMO</span>} <span className="badge">{heat(l.score)} {l.score}/100</span></h1>
      <LeadActions id={l.id} phone={l.phone} status={l.status} name={l.businessName} canWrite={canWrite(u?.role)} techNotes={l.techNotes ?? ""} />
      <div className="card grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">{rows.map(([k, v]) => <p key={k}><span className="text-stone-500">{k}</span><br /><b>{v}</b></p>)}</div>
      {l.notes && <p className="card text-sm">{l.notes}</p>}
      <section className="card"><h2 className="mb-2 font-semibold">Activity</h2>
        {l.activities.map((a) => <div key={a.id} className="border-l-2 py-1 pl-3 text-sm"><span className="text-xs text-stone-500">{a.createdAt.toISOString().slice(0, 10)} · {label(a.type)}{a.user ? ` · ${a.user.name}` : ""}</span><br />{a.content}</div>)}</section>
    </div>
  );
}
