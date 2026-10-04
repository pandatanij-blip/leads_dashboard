import { z } from "zod";
import { STATUSES, WEBSITE, INTENTS } from "./labels";
const opt = z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v ? v : undefined));
export const leadSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required").max(200),
  contactPerson: opt, designation: opt,
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,19}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  area: opt, city: opt, address: opt, mapsUrl: opt, website: opt, instagram: opt, facebook: opt,
  websiteStatus: z.enum(WEBSITE).optional(), intent: z.enum(INTENTS).optional(),
  intentSignal: opt, status: z.enum(STATUSES).optional(),
  industryId: opt, sourceId: opt, campaignId: opt, packageId: opt, assignedToId: opt,
  quotedAmount: z.coerce.number().int().min(0).optional(),
  probability: z.coerce.number().int().min(0).max(100).optional(),
  nextFollowUp: z.string().optional().or(z.literal("")).transform((v) => (v ? new Date(v) : undefined)),
  notes: z.string().max(5000).optional(), techNotes: z.string().max(5000).optional(),
});
export const activitySchema = z.object({
  type: z.enum(["CALL","WHATSAPP","EMAIL","MEETING","DEMO","QUOTATION","FOLLOW_UP","NOTE"]),
  content: z.string().trim().min(1, "Write something first").max(2000),
  callResult: opt, durationMin: z.coerce.number().int().min(0).max(600).optional(),
  followUpAt: z.string().optional().or(z.literal("")),
});
