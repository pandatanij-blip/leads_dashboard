import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard, handleErr, fail } from "@/lib/api";
import { activitySchema } from "@/lib/validators";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const g = await guard(true); if ("error" in g) return g.error;
  try {
    const d = activitySchema.parse(await req.json());
    const lead = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!lead) return fail("Lead not found", 404);
    const a = await prisma.activity.create({ data: { leadId: lead.id, userId: g.user.id, type: d.type, content: d.content, callResult: d.callResult, durationMin: d.durationMin } });
    const upd: Record<string, unknown> = { lastContacted: new Date() };
    if (d.followUpAt) {
      const dueAt = new Date(d.followUpAt);
      if (isNaN(dueAt.getTime())) return fail("Invalid follow-up date", 422);
      await prisma.followUp.create({ data: { leadId: lead.id, dueAt, reason: d.content.slice(0, 120) } });
      upd.nextFollowUp = dueAt;
    }
    await prisma.lead.update({ where: { id: lead.id }, data: upd });
    return NextResponse.json(a, { status: 201 });
  } catch (e) { return handleErr(e); }
}
