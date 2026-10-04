"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const f = new FormData(e.currentTarget);
    const r = await signIn("credentials", { email: f.get("email"), password: f.get("password"), redirect: false });
    setBusy(false);
    if (r?.error) setErr("Email or password is incorrect"); else window.location.href = "/";
  }
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-bold">WEBX CRM</h1>
        <p className="text-sm text-stone-500">Sign in to manage leads and follow-ups.</p>
        <input name="email" type="email" required placeholder="Email" className="inp" />
        <input name="password" type="password" required placeholder="Password" className="inp" />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}
