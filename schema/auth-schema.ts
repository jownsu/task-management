import { z } from "zod";

export const login_schema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export type LoginSchema = z.infer<typeof login_schema>;
