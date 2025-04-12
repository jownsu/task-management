/* DB */
import { db } from "@/server";
import { accounts, users } from "@/server/schema";

/* PLUGINS */
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: DrizzleAdapter(db),
	secret: process.env.AUTH_SECRET!,
	session: { strategy: "jwt" },
	callbacks: {
		async session({ session, token }) {
			if (session && token.sub) {
				session.user.id = token.sub;
			}
			if (session.user && token.role) {
				session.user.role = token.role as string;
			}
			if (session.user) {
				session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
				session.user.name = token.name;
				session.user.email = token.email as string;
				session.user.isOAuth = token.isOAuth as boolean;
				session.user.image = token.image as string;
			}
			return session;
		},
		async jwt({ token }) {
			if (!token.sub) return token;

			const existing_user = await db.query.users.findFirst({
				where: eq(users.id, token.sub)
			});

			if (!existing_user) return token;

			const existing_account = await db.query.accounts.findFirst({
				where: eq(accounts.userId, existing_user.id)
			});

			token.isOAuth = !!existing_account;
			token.name = existing_user.name;
			token.email = existing_user.email;
			token.role = existing_user.role;
			token.isTwoFactorEnabled = existing_user.twoFactorEnabled;
			token.image = existing_user.image;
			return token;
		}
	},
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			allowDangerousEmailAccountLinking: true
		}),
		Github({
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			allowDangerousEmailAccountLinking: true
		})
	]
});
