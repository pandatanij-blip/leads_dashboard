import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildWhere } from "@/lib/leadQuery";
import { heat } from "@/lib/score";
import { inr, label, waLink, STATUSES, WEBSITE, INTENTS } from "@/lib/labels";
import LeadForm from "@/components/LeadForm";
export const dynamic = "force-dynamic";

export default async function Leads({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const take = 25, page = Math.max(1, Number(searchParams.page) || 1);
  const where = buildWhere(searchParams);
  const [rows, total, industries, sources] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take, include: { industry: true } }),
    prisma.lead.count({ where }), prisma.industry.findMany({ orderBy: { name: "asc" } }), prisma.leadSource.findMany({ orderBy: { name: "asc" } }),
  ]);
  const qs = (o: Record<string, string>) => new URLSearchParams({ ...(Object.fromEntries(Object.entries(searchParams).filter(([k, v]) => v && k !== "new" && k !== "page")) as Record<string, string>), ...o }).toString();
  const pages = Math.ceil(total / take);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2"><h1 className="flex-1 text-2xl font-bold">Leads ({total})</h1>
        <a className="btn-g" href={`/api/leads/export?${qs({})}`}>Export CSV</a></div>
      <LeadForm industries={industries} sources={sources} open={searchParams.new === "1"} />
      <form className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <input name="q" defaultValue={searchParams.q} placeholder="Search…" className="inp" />
        <select name="industryId" defaultValue={searchParams.industryId ?? ""} className="inp"><option value="">All industries</option>{industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
        <select name="status" defaultValue={searchParams.status ?? ""} className="inp"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
        <select name="ws" defaultValue={searchParams.ws ?? ""} className="inp"><option value="">Any website</option>{WEBSITE.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
        <select name="intent" defaultValue={searchParams.intent ?? ""} className="inp"><option value="">Any intent</option>{INTENTS.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
        <div className="flex gap-2"><button className="btn">Filter</button><Link href="/leads" className="btn-g">Clear</Link></div>
      </form>
      {rows.length === 0 ? <p className="card text-stone-500">No leads match. Clear the filters or add a lead above.</p> : (
        <div className="space-y-2 md:hidden">{rows.map((l) => (
          <Link key={l.id} href={`/leads/${l.id}`} className="card block"><b>{l.businessName}</b><p className="text-sm text-stone-500">{l.industry?.name} · {l.area}</p>
            <p className="mt-1 text-sm">{label(l.status)} · <span className="badge">{heat(l.score)} {l.score}</span></p></Link>))}</div>)}
      {rows.length > 0 && (
        <div className="card hidden overflow-x-auto md:block"><table className="w-full text-sm">
          <thead className="text-left text-stone-500"><tr>{["#", "Business", "Industry", "Area", "Phone", "Website", "Intent", "Status", "Score", "Quote", "Next follow-up"].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
          <tbody>{rows.map((l) => (
            <tr key={l.id} className="border-t hover:bg-amber-50">
              <td className="p-2">{l.seq}</td><td className="p-2 font-medium"><Link href={`/leads/${l.id}`}>{l.businessName}</Link></td><td className="p-2">{l.industry?.name}</td><td className="p-2">{l.area}</td>
              <td className="p-2"><a href={`tel:${l.phone}`}>{l.phone}</a> · <a href={waLink(l.phone)} target="_blank">WA</a></td>
              <td className="p-2"><span className="badge">{label(l.websiteStatus)}</span></td><td className="p-2">{label(l.intent)}</td><td className="p-2">{label(l.status)}</td>
              <td className="p-2"><span className="badge">{heat(l.score)} {l.score}</span></td><td className="p-2">{l.quotedAmount ? inr(l.quotedAmount) : "–"}</td>
              <td className="p-2">{l.nextFollowUp?.toISOString().slice(0, 10) ?? "–"}</td></tr>))}</tbody></table></div>)}
      {pages > 1 && <div className="mt-3 flex items-center gap-2">{page > 1 && <Link className="btn-g" href={`/leads?${qs({ page: String(page - 1) })}`}>Previous</Link>}<span className="text-sm">Page {page} of {pages}</span>{page < pages && <Link className="btn-g" href={`/leads?${qs({ page: String(page + 1) })}`}>Next</Link>}</div>}
    </div>
  );
}
