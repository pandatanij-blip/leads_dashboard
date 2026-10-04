import { prisma } from "@/lib/db";
import { inr, label, OPEN_EXCLUDED, STATUSES } from "@/lib/labels";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [groups, open, due, industries] = await Promise.all([
    prisma.lead.groupBy({ by: ["status"], _count: true }),
    prisma.lead.findMany({ where: { status: { notIn: OPEN_EXCLUDED as never } }, select: { quotedAmount: true, probability: true } }),
    prisma.lead.count({ where: { nextFollowUp: { lte: new Date() }, status: { notIn: OPEN_EXCLUDED as never } } }),
    prisma.lead.groupBy({ by: ["industryId"], _count: true }),
  ]);
  const c = (s: string) => groups.find((g) => g.status === s)?._count ?? 0;
  const total = groups.reduce((a, g) => a + g._count, 0);
  const pipeline = open.reduce((a, l) => a + l.quotedAmount, 0);
  const expected = open.reduce((a, l) => a + (l.quotedAmount * l.probability) / 100, 0);
  const won = c("WON");
  const names = await prisma.industry.findMany({ where: { id: { in: industries.map((i) => i.industryId!).filter(Boolean) } } });
  const k: [string, string | number][] = [["Total leads", total], ["New", c("NEW")], ["Contacted", c("CONTACTED")], ["Interested", c("INTERESTED")], ["Demo sent", c("DEMO_SENT")], ["Follow-up due", due], ["Negotiation", c("NEGOTIATION")], ["Won", won], ["Lost", c("LOST")], ["Pipeline", inr(pipeline)], ["Expected revenue", inr(expected)], ["Conversion", (total ? (won / total) * 100 : 0).toFixed(1) + "%"]];
  const funnel = ["NEW", "CONTACTED", "REPLIED", "INTERESTED", "DEMO_SENT", "NEGOTIATION", "WON"];
  const reach = funnel.map((s) => groups.filter((g) => STATUSES.indexOf(g.status) >= STATUSES.indexOf(s as never)).reduce((a, g) => a + g._count, 0));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {total === 0 && <p className="card text-stone-500">No leads yet. Add your first lead to see numbers here.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {k.map(([n, v]) => <div key={n} className="card"><p className="text-xs text-stone-500">{n}</p><p className="text-2xl font-bold">{v}</p></div>)}
      </div>
      <section className="card"><h2 className="mb-2 font-semibold">Sales funnel</h2>
        {funnel.map((s, i) => (
          <div key={s} className="my-1 flex items-center gap-2 text-sm"><span className="w-24">{label(s)}</span>
            <div className="h-5 flex-1 rounded bg-stone-100"><div className="h-5 rounded bg-teal-700 px-2 text-xs text-white" style={{ width: `${reach[0] ? Math.max(4, (reach[i] / reach[0]) * 100) : 4}%` }}>{reach[i]}</div></div>
            <span className="w-12 text-xs text-stone-500">{i && reach[i - 1] ? Math.round((reach[i] / reach[i - 1]) * 100) + "%" : ""}</span></div>))}
      </section>
      <section className="card"><h2 className="mb-2 font-semibold">Leads by industry</h2>
        {industries.sort((a, b) => b._count - a._count).map((i) => <p key={i.industryId ?? "none"} className="flex justify-between border-b py-1 text-sm"><span>{names.find((n) => n.id === i.industryId)?.name ?? "Unassigned"}</span><b>{i._count}</b></p>)}
      </section>
    </div>
  );
}
