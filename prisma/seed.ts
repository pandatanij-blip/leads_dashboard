import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const p = new PrismaClient();
const norm = (s: string) => s.replace(/\D/g, "").slice(-10);
const INDUSTRIES = ["Boutique","Bakery","Nursery","Gift Shop","Mithai / Sweets","Dry Fruits","Corporate Gifting","Florist","Diya / Candle / Decorative Items","Event Planner","Decoration Service","Wedding Planner","Salon / Spa","Mehndi Artist","Clothing","Jewellery","Footwear","Cosmetics","Home Décor","Furniture","Interior Designer","Restaurant","Cafe","Catering","Party Supplies","Puja Items","Electronics","Printing / Packaging","Tailor","Handicrafts","Real Estate","Builder","Manufacturing","Education / Coaching","Healthcare","Hotel / Hospitality","Logistics","Professional Services","Other"];
const SOURCES = ["Google Maps","Google Search","Public Social Post","Public Business Directory","Referral","Website Enquiry","WhatsApp","Facebook","Instagram","LinkedIn","Other"];
const AREAS = ["Sector 15","Sector 16","Sector 21","Sector 28","Sector 29","Sector 35","Sector 37","NIT","Greenfield Colony","Ballabhgarh"];
const WS = ["NO_WEBSITE","OUTDATED","PRESENT","ECOMMERCE_NEEDED","UNKNOWN"] as const;
const INT = ["HIGH","MEDIUM","LOW","UNVERIFIED"] as const;
const ST = ["NEW","CONTACTED","REPLIED","INTERESTED","DEMO_SENT","FOLLOW_UP","NEGOTIATION","WON","LOST","NOT_INTERESTED"] as const;
const PROB: Record<string, number> = { NEW: 5, CONTACTED: 10, REPLIED: 20, INTERESTED: 35, DEMO_SENT: 45, FOLLOW_UP: 40, NEGOTIATION: 65, WON: 100, LOST: 0, NOT_INTERESTED: 0 };

async function main() {
  const pw = await bcrypt.hash(process.env.SEED_PASSWORD ?? "ChangeMe123!", 10);
  const shubham = await p.user.upsert({ where: { email: "shubham9971833801@gmail.com" }, update: {}, create: { name: "Shubham Singh", email: "shubham9971833801@gmail.com", phone: "8130505876", role: "ADMIN", title: "Sales Person", passwordHash: pw } });
  await p.user.upsert({ where: { email: "tanisha@webx.local" }, update: {}, create: { name: "Tanisha Sharma", email: "tanisha@webx.local", role: "DEVELOPER", title: "Web Developer", passwordHash: pw } });
  for (const name of INDUSTRIES) await p.industry.upsert({ where: { name }, update: {}, create: { name } });
  for (const name of SOURCES) await p.leadSource.upsert({ where: { name }, update: {}, create: { name } });
  if (!(await p.package.count())) await p.package.createMany({ data: [
    { name: "Basic Business Website", price: 5000, amc: "3 months free AMC" },
    { name: "10–15 Page SEO-Optimised Website", price: 15000, amc: "9 months AMC" },
    { name: "Premium Technical / Brochure Website", price: 20000, priceMax: 25000, amc: "1 year AMC" }] });
  let camp = await p.campaign.findFirst({ where: { name: "Diwali Website Campaign 2026" } });
  if (!camp) camp = await p.campaign.create({ data: { name: "Diwali Website Campaign 2026" } });
  if (await p.lead.count()) return console.log("Leads exist; skipping lead seed.");
  const inds = await p.industry.findMany(); const src = await p.leadSource.findFirst({ where: { name: "Google Maps" } });
  const ind = (n: string) => inds.find((i) => i.name === n)?.id;
  await p.lead.create({ data: { businessName: "Meghha Vermaa's Boutique", contactPerson: "Meghha Vermaa", phone: "+91 98705 17911", phoneNorm: norm("+91 98705 17911"), area: "Sector 9", industryId: ind("Boutique"), sourceId: src?.id, assignedToId: shubham.id, campaignId: camp.id, status: "CONTACTED", probability: 10, websiteStatus: "NO_WEBSITE", intent: "HIGH", score: 75, activities: { create: { type: "NOTE", content: "Imported from existing Excel" } } } });
  const demo = ["Boutique","Bakery","Gift Shop","Nursery","Mithai / Sweets","Dry Fruits","Event Planner","Florist","Interior Designer","Restaurant","Cafe","Salon / Spa","Jewellery","Clothing","Furniture"];
  for (let i = 0; i < 49; i++) {
    const i2 = demo[i % demo.length], st = ST[(i * 3) % 10], amt = [0, 5000, 15000, 22500][i % 4], ph = `+91 90000 ${String(10000 + i * 37).slice(0, 5)}`;
    await p.lead.create({ data: { businessName: `Demo ${i2} ${i + 1} (DEMO)`, contactPerson: "Demo Contact", phone: ph, phoneNorm: norm(ph) + String(i), area: AREAS[i % AREAS.length], industryId: ind(i2), sourceId: src?.id, assignedToId: shubham.id, campaignId: camp.id, isDemo: true, status: st, probability: PROB[st], websiteStatus: WS[i % 5], intent: INT[i % 4], quotedAmount: amt, score: 20 + ((i * 7) % 80), nextFollowUp: new Date(Date.now() + ((i % 9) - 3) * 86400000), activities: { create: { type: "NOTE", content: "DEMO record" } } } });
  }
  console.log("Seeded.");
}
main().finally(() => p.$disconnect());
