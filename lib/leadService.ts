import { prisma } from "./db";
import { leadScore, DEFAULT_PROB } from "./score";
import { norm } from "./labels";

export async function findDuplicate(phone: string, email?: string, name?: string, area?: string, excludeId?: string) {
  const or: object[] = [{ phoneNorm: norm(phone) }];
  if (email) or.push({ email });
  if (name) or.push({ businessName: { equals: name, mode: "insensitive" }, area: area ?? null });
  return prisma.lead.findFirst({ where: { OR: or, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true, businessName: true, area: true } });
}
export function withScore<T extends { websiteStatus?: string; intent?: string; intentSignal?: string; status?: string }>(d: T) {
  return leadScore({ websiteStatus: d.websiteStatus ?? "UNKNOWN", intent: d.intent ?? "UNVERIFIED", intentSignal: d.intentSignal, status: d.status ?? "NEW" });
}
export async function notifyAll(title: string, href: string) {
  const users = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SALES"] } }, select: { id: true } });
  await prisma.notification.createMany({ data: users.map((u) => ({ userId: u.id, title, href })) });
}
export { DEFAULT_PROB };
