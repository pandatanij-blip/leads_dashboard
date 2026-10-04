import type { Prisma } from "@prisma/client";
export type Filters = Record<string, string | undefined>;
export function buildWhere(f: Filters): Prisma.LeadWhereInput {
  const w: Prisma.LeadWhereInput = {};
  if (f.q) {
    const q = f.q.trim();
    w.OR = ["businessName","contactPerson","phone","email","area","city","notes"].map((k) => ({ [k]: { contains: q, mode: "insensitive" } })) as Prisma.LeadWhereInput[];
    w.OR.push({ industry: { name: { contains: q, mode: "insensitive" } } });
  }
  if (f.status) w.status = f.status as never;
  if (f.intent) w.intent = f.intent as never;
  if (f.ws) w.websiteStatus = f.ws as never;
  if (f.industryId) w.industryId = f.industryId;
  if (f.area) w.area = f.area;
  if (f.campaignId) w.campaignId = f.campaignId;
  return w;
}
