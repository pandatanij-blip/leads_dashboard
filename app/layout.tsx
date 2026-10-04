import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "WEBX CRM", description: "WEBX – Digital Solutions sales CRM" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
