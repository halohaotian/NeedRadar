import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { getDb } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        if (!process.env.DATABASE_URL) return null;
        try {
          const sql = getDb();
          const users = await sql`
            SELECT id, email, name, image FROM nr_users WHERE email = ${credentials.email as string}
          `;
          if (!users[0]) return null;
          const user = users[0];
          return {
            id: String(user.id),
            email: user.email as string,
            name: user.name as string | null,
            image: user.image as string | null,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      if (!process.env.DATABASE_URL) return true;
      try {
        const sql = getDb();
        await sql`
          INSERT INTO nr_users (email, name, image, provider)
          VALUES (${user.email}, ${user.name || null}, ${user.image || null}, 'oauth')
          ON CONFLICT (email) DO UPDATE SET
            name = COALESCE(EXCLUDED.name, nr_users.name),
            image = COALESCE(EXCLUDED.image, nr_users.image),
            updated_at = NOW()
        `;
      } catch (err) {
        console.error("Auth signIn callback error:", err);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});
