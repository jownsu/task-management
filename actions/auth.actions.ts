"use server";

/* PLUGINS */
import bcrypt from "bcryptjs";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { generatePasswordResetToken, getPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

/* SCHEMA */
import { signup_schema, forgot_password_schema, reset_password_schema } from "@/schema/auth-schema";

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

/**
 * DOCU: Generates a password reset token and sends reset email. <br>
 * Always returns success to prevent email enumeration. <br>
 * Triggered: When a user submits the forgot password form. <br>
 * Last Updated: April 02, 2026
 * @author Jhones
 */
export const forgotPassword = actionClient
	.schema(forgot_password_schema)
	.action(async ({ parsedInput }) => {
		const { email } = parsedInput;

		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, password: true },
		});

		/* Only send email if user exists and has a password (not OAuth-only) */
		if (user?.password) {
			const reset_token = await generatePasswordResetToken(email);
			await sendPasswordResetEmail(email, reset_token.token);
		}

		/* Always return success to prevent email enumeration */
		return { success: true };
	});

/**
 * DOCU: Validates the reset token and updates the user's password. <br>
 * Triggered: When a user submits the reset password form. <br>
 * Last Updated: April 02, 2026
 * @author Jhones
 */
export const resetPassword = actionClient
	.schema(reset_password_schema)
	.action(async ({ parsedInput }) => {
		const { token, password } = parsedInput;

		const verification_token = await getPasswordResetToken(token);

		if (!verification_token) {
			throw new Error("Invalid or expired reset link. Please request a new one.");
		}

		const user = await prisma.user.findUnique({
			where: { email: verification_token.identifier },
			select: { id: true },
		});

		if (!user) {
			throw new Error("User not found");
		}

		const hashed_password = await bcrypt.hash(password, 10);

		await prisma.user.update({
			where: { id: user.id },
			data: { password: hashed_password },
		});

		/* Delete the used token */
		await prisma.verificationToken.delete({
			where: {
				identifier_token: {
					identifier: verification_token.identifier,
					token: verification_token.token,
				},
			},
		});

		return { success: true };
	});
