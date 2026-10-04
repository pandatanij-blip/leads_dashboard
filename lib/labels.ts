export const STATUSES = ["NEW","CONTACTED","REPLIED","INTERESTED","DEMO_SENT","FOLLOW_UP","NEGOTIATION","WON","LOST","NOT_INTERESTED"] as const;
export const WEBSITE = ["NO_WEBSITE","OUTDATED","PRESENT","ECOMMERCE_NEEDED","UNKNOWN"] as const;
export const INTENTS = ["HIGH","MEDIUM","LOW","UNVERIFIED"] as const;
export const OPEN_EXCLUDED = ["WON","LOST","NOT_INTERESTED"];
export const label = (v: string) => v.replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());
export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
export const digits = (p: string) => p.replace(/\D/g, "");
export const norm = (p: string) => digits(p).slice(-10);
export const waLink = (p: string, text?: string) => `https://wa.me/${digits(p)}${text ? "?text=" + encodeURIComponent(text) : ""}`;
