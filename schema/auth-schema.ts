import { z } from "zod";

export const login_schema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export type LoginSchema = z.infer<typeof login_schema>;

export const signup_schema = z
	.object({
		name: z.string().min(1, "Name is required"),
		email: z.string().email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirm_password: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: "Passwords do not match",
		path: ["confirm_password"],
	});

export type SignupSchema = z.infer<typeof signup_schema>;

export const forgot_password_schema = z.object({
	email: z.string().email("Invalid email address"),
});

export type ForgotPasswordSchema = z.infer<typeof forgot_password_schema>;

export const reset_password_schema = z
	.object({
		token: z.string().min(1, "Reset token is required"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirm_password: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: "Passwords do not match",
		path: ["confirm_password"],
	});

export type ResetPasswordSchema = z.infer<typeof reset_password_schema>;
