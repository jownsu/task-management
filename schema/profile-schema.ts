import { z } from "zod";

export const update_name_schema = z.object({
	name: z.string().min(1, "Name is required"),
});

export type UpdateNameSchema = z.infer<typeof update_name_schema>;

export const change_password_schema = z
	.object({
		current_password: z.string().min(1, "Current password is required"),
		new_password: z.string().min(8, "Password must be at least 8 characters"),
		confirm_password: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: "Passwords do not match",
		path: ["confirm_password"],
	})
	.refine((data) => data.new_password !== data.current_password, {
		message: "New password must be different from current password",
		path: ["new_password"],
	});

export type ChangePasswordSchema = z.infer<typeof change_password_schema>;

export const delete_account_schema = z.object({
	confirmation_phrase: z.string().refine((value) => value === "Delete my account because I'm gay", {
		message: "Phrase does not match",
	}),
});

export type DeleteAccountSchema = z.infer<typeof delete_account_schema>;
