import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { currentUser, canWrite } from "./auth";
export const fail = (msg: string, status = 400, extra: object = {}) => NextResponse.json({ error: msg, ...extra }, { status });
export async function guard(write = false) {
  const u = await currentUser();
  if (!u) return { error: fail("Please sign in", 401) } as const;
  if (write && !canWrite(u.role)) return { error: fail("Your role can't make this change", 403) } as const;
  return { user: u } as const;
}
export function handleErr(e: unknown) {
  if (e instanceof ZodError) return fail(e.issues[0]?.message ?? "Invalid input", 422);
  console.error(e);
  return fail("Something went wrong on the server", 500);
}
