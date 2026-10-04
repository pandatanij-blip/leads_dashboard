import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard, handleErr, fail } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const g = await guard(true); if ("error" in g) return g.error;
  try {
    const { action, dueAt } = await req.json();
    const f = await prisma.followUp.findUnique({ where: { id: params.id } });
    if (!f) return fail("Follow-up not found", 404);
    if (action === "complete") {
      await prisma.followUp.update({ where: { id: f.id }, data: { status: "DONE", completedAt: new Date() } });
      const next = await prisma.followUp.findFirst({ where: { leadId: f.leadId, status: "PENDING" }, orderBy: { dueAt: "asc" } });
      await prisma.lead.update({ where: { id: f.leadId }, data: { nextFollowUp: next?.dueAt ?? null } });
      await prisma.activity.create({ data: { leadId: f.leadId, userId: g.user.id, type: "FOLLOW_UP", content: "Follow-up completed" } });
    } else if (action === "reschedule") {
      const d = new Date(dueAt);
      if (isNaN(d.getTime())) return fail("Invalid date", 422);
      await prisma.followUp.update({ where: { id: f.id }, data: { dueAt: d } });
      await prisma.lead.update({ where: { id: f.leadId }, data: { nextFollowUp: d } });
      await prisma.activity.create({ data: { leadId: f.leadId, userId: g.user.id, type: "FOLLOW_UP", content: `Rescheduled to ${d.toDateString()}` } });
    } else return fail("Unknown action", 422);
    return NextResponse.json({ ok: true });
  } catch (e) { return handleErr(e); }
}
