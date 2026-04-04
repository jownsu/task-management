/* UTILITIES */
import prisma from "@/lib/prisma";

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; /* 1 hour */

/**
 * DOCU: Generates a password reset token and stores it in VerificationToken. <br>
 * Deletes any existing token for the same email before creating a new one. <br>
 * Triggered: When the forgotPassword server action is called. <br>
 * Last Updated: April 02, 2026
 * @author Jhones
 */
export async function generatePasswordResetToken(email: string) {
	const token = crypto.randomUUID();
	const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

	/* Delete any existing reset tokens for this email */
	await prisma.verificationToken.deleteMany({
		where: { identifier: email },
	});

	const verification_token = await prisma.verificationToken.create({
		data: {
			identifier: email,
			token,
			expires,
		},
	});

	return verification_token;
}

/**
 * DOCU: Retrieves and validates a password reset token. <br>
 * Returns null if the token does not exist or has expired. <br>
 * Triggered: When the resetPassword server action is called. <br>
 * Last Updated: April 02, 2026
 * @author Jhones
 */
export async function getPasswordResetToken(token: string) {
	const verification_token = await prisma.verificationToken.findFirst({
		where: { token },
	});

	if (!verification_token) {
		return null;
	}

	if (new Date() > verification_token.expires) {
		/* Clean up expired token */
		await prisma.verificationToken.delete({
			where: {
				identifier_token: {
					identifier: verification_token.identifier,
					token: verification_token.token,
				},
			},
		});
		return null;
	}

	return verification_token;
}
