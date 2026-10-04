import { prisma } from "@/lib/db";
import { currentUser, canWrite } from "@/lib/auth";
import Kanban from "@/components/Kanban";
export const dynamic = "force-dynamic";

export default async function Pipeline() {
  const u = await currentUser();
  const leads = await prisma.lead.findMany({ include: { industry: true }, orderBy: { score: "desc" }, take: 500 });
  const cards = leads.map((l) => ({ id: l.id, businessName: l.businessName, industry: l.industry?.name ?? "", area: l.area ?? "", phone: l.phone, websiteStatus: l.websiteStatus, intent: l.intent, quotedAmount: l.quotedAmount, nextFollowUp: l.nextFollowUp?.toISOString().slice(0, 10) ?? "", status: l.status, person: l.contactPerson ?? "" }));
  return (<div><h1 className="mb-2 text-2xl font-bold">Pipeline</h1><Kanban initial={cards} canWrite={canWrite(u?.role)} /></div>);
}
