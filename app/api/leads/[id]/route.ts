import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard, handleErr, fail } from "@/lib/api";
import { leadSchema } from "@/lib/validators";
import { withScore, notifyAll, DEFAULT_PROB } from "@/lib/leadService";
import { norm, label } from "@/lib/labels";

type Ctx = { params: { id: string } };

export async function GET(_: Request, { params }: Ctx) {
  const g = await guard(); if ("error" in g) return g.error;
  const lead = await prisma.lead.findUnique({ where: { id: params.id }, include: { industry: true, activities: { orderBy: { createdAt: "desc" } }, followUps: true } });
  return lead ? NextResponse.json(lead) : fail("Lead not found", 404);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guard(); if ("error" in g) return g.error;
  try {
    const body = await req.json();
    const old = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!old) return fail("Lead not found", 404);
    // Developers may only update technical notes.
    if (g.user.role === "DEVELOPER") {
      const l = await prisma.lead.update({ where: { id: old.id }, data: { techNotes: String(body.techNotes ?? "").slice(0, 5000) } });
      return NextResponse.json(l);
    }
    const d = leadSchema.partial().parse(body);
    const data: Record<string, unknown> = { ...d };
    if (d.phone) data.phoneNorm = norm(d.phone);
    const merged = { ...old, ...d };
    data.score = withScore({ websiteStatus: merged.websiteStatus, intent: merged.intent, intentSignal: merged.intentSignal ?? undefined, status: merged.status });
    const statusChanged = d.status && d.status !== old.status;
    if (statusChanged) {
      data.probability = d.probability ?? DEFAULT_PROB[d.status!];
      data.lastContacted = new Date();
    }
    const lead = await prisma.lead.update({ where: { id: old.id }, data });
    if (statusChanged) {
      await prisma.activity.create({ data: { leadId: old.id, userId: g.user.id, type: "STATUS_CHANGE", content: `${label(old.status)} → ${label(d.status!)}` } });
      if (["INTERESTED", "NEGOTIATION", "WON"].includes(d.status!)) await notifyAll(`${lead.businessName} moved to ${label(d.status!)}`, `/leads/${lead.id}`);
    }
    return NextResponse.json(lead);
  } catch (e) { return handleErr(e); }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const g = await guard(true); if ("error" in g) return g.error;
  try { await prisma.lead.delete({ where: { id: params.id } }); return NextResponse.json({ ok: true }); }
  catch (e) { return handleErr(e); }
}
