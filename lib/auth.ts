/* PLUGINS */
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

/* UTILITIES */
import prisma from "@/lib/prisma";

/* SCHEMA */
import { login_schema } from "@/schema/auth-schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	trustHost: true,
	session: { strategy: "jwt" },
	pages: {
		error: "/auth/error",
	},
	providers: [
		Google({
			clientId: process.env["GOOGLE_CLIENT_ID"]!,
			clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
			allowDangerousEmailAccountLinking: true,
			authorization: {
				params: { prompt: "select_account" },
			},
		}),
		Credentials({
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			/**
			 * DOCU: Validates user credentials against the database. <br>
			 * Triggered: When a user submits the email/password login form. <br>
			 * Last Updated: March 05, 2026
			 * @author Jhones
			 */
			async authorize(credentials) {
				const parsed = login_schema.safeParse(credentials);

				if (!parsed.success) {
					return null;
				}

				const { email, password } = parsed.data;

				const user = await prisma.user.findUnique({
					where: { email },
				});

				if (!user || !user.password) {
					return null;
				}

				const is_password_valid = await bcrypt.compare(password, user.password);

				if (!is_password_valid) {
					return null;
				}

				return {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
				};
			},
		}),
	],
	callbacks: {
		/**
		 * DOCU: Attaches user ID to the JWT token. <br>
		 * Triggered: When a JWT token is created or updated. <br>
		 * Last Updated: March 05, 2026
		 * @author Jhones
		 */
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		/**
		 * DOCU: Attaches user ID from token to the session object. <br>
		 * Triggered: When a session is checked. <br>
		 * Last Updated: March 05, 2026
		 * @author Jhones
		 */
		async session({ session, token }) {
			if (token?.id) {
				session.user.id = token.id as string;
			}
			return session;
		},
	},
});
