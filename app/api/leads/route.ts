import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard, handleErr, fail } from "@/lib/api";
import { leadSchema } from "@/lib/validators";
import { buildWhere } from "@/lib/leadQuery";
import { findDuplicate, withScore, DEFAULT_PROB } from "@/lib/leadService";
import { norm } from "@/lib/labels";

export async function GET(req: Request) {
  const g = await guard(); if ("error" in g) return g.error;
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const page = Math.max(1, Number(sp.page) || 1), take = 25;
  const where = buildWhere(sp);
  const [rows, total] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take, include: { industry: true } }),
    prisma.lead.count({ where }),
  ]);
  return NextResponse.json({ rows, total, page, pages: Math.ceil(total / take) });
}

export async function POST(req: Request) {
  const g = await guard(true); if ("error" in g) return g.error;
  try {
    const d = leadSchema.parse(await req.json());
    const force = new URL(req.url).searchParams.get("force") === "1";
    if (!force) {
      const dup = await findDuplicate(d.phone, d.email, d.businessName, d.area);
      if (dup) return fail("Possible duplicate lead", 409, { duplicate: dup });
    }
    const status = d.status ?? "NEW";
    const lead = await prisma.lead.create({
      data: {
        ...d, status, phoneNorm: norm(d.phone), city: d.city ?? "Faridabad",
        probability: d.probability ?? DEFAULT_PROB[status], score: withScore({ ...d, status }),
        assignedToId: d.assignedToId ?? g.user.id,
        activities: { create: { type: "NOTE", content: "Lead created", userId: g.user.id } },
        ...(d.nextFollowUp ? { followUps: { create: { dueAt: d.nextFollowUp, reason: "First follow-up" } } } : {}),
      },
    });
    return NextResponse.json(lead, { status: 201 });
  } catch (e) { return handleErr(e); }
}
