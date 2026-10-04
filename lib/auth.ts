import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: { email: {}, password: {} },
      async authorize(c) {
        if (!c?.email || !c.password) return null;
        const u = await prisma.user.findUnique({ where: { email: c.email.toLowerCase().trim() } });
        if (!u || !(await bcrypt.compare(c.password, u.passwordHash))) return null;
        return { id: u.id, name: u.name, email: u.email, role: u.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as { role: string }).role; }
      return token;
    },
    session({ session, token }) {
      if (session.user) { session.user.id = token.id as string; session.user.role = token.role as string; }
      return session;
    },
  },
};

export async function currentUser() {
  const s = await getServerSession(authOptions);
  return s?.user ?? null;
}
// Developers are read-only on leads except technical notes.
export const canWrite = (role?: string) => role === "ADMIN" || role === "SALES";
