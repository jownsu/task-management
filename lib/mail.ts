/* PLUGINS */
import { Resend } from "resend";

/* CONSTANTS */
import { ENV } from "@/constants/env";

const resend = new Resend(ENV.RESEND_API_KEY);

/**
 * DOCU: Sends a password reset email with a tokenized link. <br>
 * Triggered: When a user submits the forgot password form. <br>
 * Last Updated: April 02, 2026
 * @author Jhones
 */
export async function sendPasswordResetEmail(email: string, token: string) {
	const reset_link = `${ENV.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

	await resend.emails.send({
		from: "Kanban <onboarding@resend.dev>",
		to: email,
		subject: "Reset your password",
		html: `
			<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
				<h2 style="color: #635FC7; margin-bottom: 24px;">Reset your password</h2>
				<p style="color: #828FA3; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
					We received a request to reset your password. Click the button below to choose a new password. This link will expire in 1 hour.
				</p>
				<a href="${reset_link}" style="display: inline-block; background-color: #635FC7; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
					Reset Password
				</a>
				<p style="color: #828FA3; font-size: 13px; line-height: 1.6; margin-top: 32px;">
					If you didn't request this, you can safely ignore this email.
				</p>
			</div>
		`,
	});
}
