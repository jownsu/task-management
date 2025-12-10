import { db } from "@/db";
import { users, refresh_tokens } from "@/db/schema";
import {
	generateAccessToken,
	generateRefreshToken,
} from "@/services/auth-service";

/**
 * DOCU: Creates a test user in the database. <br>
 * Triggered: In tests that need an authenticated user. <br>
 * Last Updated: December 10, 2025
 */
export const createTestUser = async (overrides?: {
	email?: string;
	name?: string;
	auth_provider?: "email" | "google";
}) => {
	const [user] = await db
		.insert(users)
		.values({
			email: overrides?.email || "test@example.com",
			name: overrides?.name || "Test User",
			auth_provider: overrides?.auth_provider || "google",
			email_verified: true,
		})
		.returning();

	return user;
};

/**
 * DOCU: Creates auth tokens for a test user. <br>
 * Triggered: In tests that need authenticated requests. <br>
 * Last Updated: December 10, 2025
 */
export const createTestTokens = async (user_id: string, email: string) => {
	const access_token = generateAccessToken(user_id, email);
	const refresh_token = await generateRefreshToken(user_id, email);

	return { access_token, refresh_token };
};

/**
 * DOCU: Parses cookies from Set-Cookie header. <br>
 * Triggered: In tests that verify cookie responses. <br>
 * Last Updated: December 10, 2025
 */
export const parseCookies = (setCookieHeader: string[]): Record<string, string> => {
	const cookies: Record<string, string> = {};

	setCookieHeader.forEach((cookie) => {
		const [nameValue] = cookie.split(";");
		const [name, value] = nameValue.split("=");
		cookies[name.trim()] = value?.trim() || "";
	});

	return cookies;
};

/**
 * DOCU: Formats cookies for request header. <br>
 * Triggered: In tests that send authenticated requests. <br>
 * Last Updated: December 10, 2025
 */
export const formatCookieHeader = (cookies: Record<string, string>): string => {
	return Object.entries(cookies)
		.map(([name, value]) => `${name}=${value}`)
		.join("; ");
};
