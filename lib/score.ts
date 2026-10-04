// Scoring rules are plain data so they can later be moved into a Settings table.
export const SCORE_RULES = {
  NO_WEBSITE: 30, OUTDATED: 20, ECOMMERCE_NEEDED: 30,
  HIGH: 30, MEDIUM: 15, PUBLIC_SIGNAL: 40,
  REPLIED_PLUS: 15, INTERESTED: 30, DEMO_SENT: 40,
};
type L = { websiteStatus: string; intent: string; intentSignal?: string | null; status: string };
export function leadScore(l: L): number {
  const r = SCORE_RULES; let s = 0;
  if (l.websiteStatus === "NO_WEBSITE") s += r.NO_WEBSITE;
  if (l.websiteStatus === "OUTDATED") s += r.OUTDATED;
  if (l.websiteStatus === "ECOMMERCE_NEEDED") s += r.ECOMMERCE_NEEDED;
  if (l.intent === "HIGH") s += r.HIGH;
  if (l.intent === "MEDIUM") s += r.MEDIUM;
  if (l.intentSignal) s += r.PUBLIC_SIGNAL;
  if (["REPLIED", "INTERESTED", "DEMO_SENT", "FOLLOW_UP", "NEGOTIATION"].includes(l.status)) s += r.REPLIED_PLUS;
  if (l.status === "INTERESTED") s += r.INTERESTED;
  if (l.status === "DEMO_SENT") s += r.DEMO_SENT;
  return Math.min(100, s);
}
export const heat = (s: number) => (s >= 80 ? "Hot" : s >= 50 ? "Warm" : "Cold");
export const DEFAULT_PROB: Record<string, number> = { NEW: 5, CONTACTED: 10, REPLIED: 20, INTERESTED: 35, DEMO_SENT: 45, FOLLOW_UP: 40, NEGOTIATION: 65, WON: 100, LOST: 0, NOT_INTERESTED: 0 };
