"use client";
import { signOut } from "next-auth/react";
export default function SignOut() { return <button className="btn-g" onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</button>; }
