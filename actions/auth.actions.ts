"use server";

/* PLUGINS */
import bcrypt from "bcryptjs";

/* UTILITIES */
import prisma from "@/lib/prisma";

/* SCHEMA */
import { signup_schema } from "@/schema/auth-schema";

/* TYPES */
import type { SignupSchema } from "@/schema/auth-schema";

/**
 * DOCU: Creates a new user account with hashed password. <br>
 * Triggered: When a user submits the signup form. <br>
 * Last Updated: March 25, 2026
 * @author Jhones
 */
export async function signupUser(data: SignupSchema) {
	const parsed = signup_schema.safeParse(data);

	if (!parsed.success) {
		return { error: "Invalid form data" };
	}

	const { name, email, password } = parsed.data;

	const existing_user = await prisma.user.findUnique({
		where: { email },
	});

	if (existing_user) {
		return { error: "An account with this email already exists" };
	}

	const hashed_password = await bcrypt.hash(password, 10);

	await prisma.user.create({
		data: {
			name,
			email,
			password: hashed_password,
		},
	});

	return { success: "Account created successfully" };
}
