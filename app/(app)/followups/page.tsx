import { prisma } from "@/lib/db";
import FollowUpButtons from "@/components/FollowUpButtons";
export const dynamic = "force-dynamic";

export default async function FollowUps() {
  const list = await prisma.followUp.findMany({ where: { status: "PENDING" }, orderBy: { dueAt: "asc" }, include: { lead: true }, take: 300 });
  const sod = new Date(); sod.setHours(0, 0, 0, 0);
  const eod = new Date(sod.getTime() + 86400000), eot = new Date(sod.getTime() + 2 * 86400000);
  const groups = [
    { t: "Overdue", c: "text-red-600", f: list.filter((x) => x.dueAt < sod) },
    { t: "Today", c: "text-orange-500", f: list.filter((x) => x.dueAt >= sod && x.dueAt < eod) },
    { t: "Tomorrow", c: "", f: list.filter((x) => x.dueAt >= eod && x.dueAt < eot) },
    { t: "Upcoming", c: "", f: list.filter((x) => x.dueAt >= eot) },
  ];
  return (
    <div className="space-y-4"><h1 className="text-2xl font-bold">Follow-ups</h1>
      {list.length === 0 && <p className="card text-stone-500">No follow-ups pending. Set one from any lead.</p>}
      {groups.map((g) => (
        <section key={g.t} className="card"><h2 className={`mb-2 font-semibold ${g.c}`}>{g.t} ({g.f.length})</h2>
          {g.f.map((x) => (
            <div key={x.id} className="flex flex-wrap items-center justify-between gap-2 border-t py-2 text-sm">
              <span><b className={g.c}>{x.dueAt.toISOString().slice(0, 10)}</b> · {x.lead.businessName}<br /><span className="text-stone-500">{x.lead.contactPerson} · {x.reason}</span></span>
              <FollowUpButtons id={x.id} leadId={x.leadId} phone={x.lead.phone} /></div>))}
        </section>))}
    </div>
  );
}
