import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SignOut from "@/components/SignOut";

const NAV = [["/", "Dashboard"], ["/leads", "Leads"], ["/pipeline", "Pipeline"], ["/followups", "Follow-ups"]];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  if (!u) redirect("/login");
  const unread = await prisma.notification.count({ where: { userId: u.id, read: false } });
  const due = await prisma.followUp.count({ where: { status: "PENDING", dueAt: { lte: new Date(Date.now() + 86400000) } } });
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-52 shrink-0 bg-teal-900 p-4 text-teal-50 md:block">
        <p className="text-xl font-bold">WEBX</p><p className="mb-6 text-xs text-teal-300">Digital Solutions</p>
        {NAV.map(([h, n]) => <Link key={h} href={h} className="block rounded-lg px-3 py-2 hover:bg-teal-800">{n}</Link>)}
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 border-b bg-white px-4 py-3">
          <form action="/leads" className="flex-1"><input name="q" placeholder="Search leads, phone, area…" className="inp max-w-md" /></form>
          <span className="badge" title="Unread notifications / follow-ups due">🔔 {unread} · {due} due</span>
          <Link href="/leads?new=1" className="btn">+ Add lead</Link>
          <span className="hidden text-sm sm:inline">{u.name}</span><SignOut />
        </header>
        <main className="p-4 pb-24 md:p-6">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 flex border-t bg-teal-900 text-xs text-teal-50 md:hidden">
          {NAV.map(([h, n]) => <Link key={h} href={h} className="flex-1 py-3 text-center">{n}</Link>)}
        </nav>
      </div>
    </div>
  );
}
