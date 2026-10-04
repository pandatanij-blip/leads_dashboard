import { prisma } from "@/lib/db";
import { guard } from "@/lib/api";
import { buildWhere } from "@/lib/leadQuery";

const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
export async function GET(req: Request) {
  const g = await guard(); if ("error" in g) return g.error;
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const rows = await prisma.lead.findMany({ where: buildWhere(sp), include: { industry: true }, orderBy: { createdAt: "desc" } });
  const cols = ["seq","businessName","contactPerson","industry","area","city","phone","email","websiteStatus","intent","status","quotedAmount","probability","score","nextFollowUp","notes"];
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => q(c === "industry" ? r.industry?.name : (r as Record<string, unknown>)[c])).join(","))].join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="webx-leads.csv"' } });
}
