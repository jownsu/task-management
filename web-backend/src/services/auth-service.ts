import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { eq, and, isNull } from "drizzle-orm";
import { config } from "@/config/environment";
import { db } from "@/db";
import { users, oauth_accounts, refresh_tokens } from "@/db/schema";

/**
 * DOCU: Google OAuth2 client instance for handling authentication. <br>
 * Last Updated: December 10, 2025
 */
const oauth2Client = new OAuth2Client({
	clientId: config.google.clientId,
	clientSecret: config.google.clientSecret,
	redirectUri: config.google.redirectUri,
});

/**
 * DOCU: Generates the Google OAuth consent URL. <br>
 * Triggered: When user clicks "Login with Google". <br>
 * Last Updated: December 10, 2025
 */
export const getGoogleAuthUrl = (): string => {
	const scopes = [
		"https://www.googleapis.com/auth/userinfo.email",
		"https://www.googleapis.com/auth/userinfo.profile",
	];

	return oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: scopes,
		prompt: "consent",
	});
};

/**
 * DOCU: Exchanges authorization code for tokens and retrieves user info. <br>
 * Triggered: When Google redirects back to callback URL. <br>
 * Last Updated: December 10, 2025
 */
export const getGoogleUserInfo = async (code: string) => {
	const { tokens } = await oauth2Client.getToken(code);
	oauth2Client.setCredentials(tokens);

	/* Fetch user info from Google */
	const response = await fetch(
		"https://www.googleapis.com/oauth2/v2/userinfo",
		{
			headers: {
				Authorization: `Bearer ${tokens.access_token}`,
			},
		}
	);

	if (!response.ok) {
		throw new Error("Failed to fetch Google user info");
	}

	return response.json() as Promise<{
		id: string;
		email: string;
		name: string;
		picture: string;
	}>;
};

/**
 * DOCU: Finds or creates a user from Google OAuth data. <br>
 * Triggered: After successfully getting Google user info. <br>
 * Last Updated: December 10, 2025
 */
export const findOrCreateGoogleUser = async (google_user: {
	id: string;
	email: string;
	name: string;
	picture: string;
}) => {
	/* Check if OAuth account already exists */
	const existing_oauth = await db.query.oauth_accounts.findFirst({
		where: eq(oauth_accounts.provider_account_id, google_user.id),
	});

	if (existing_oauth) {
		/* User exists, fetch and return */
		const existing_user = await db.query.users.findFirst({
			where: eq(users.id, existing_oauth.user_id),
		});
		return existing_user;
	}

	/* Check if user with this email exists (might have registered with email/password) */
	const existing_user_by_email = await db.query.users.findFirst({
		where: eq(users.email, google_user.email),
	});

	if (existing_user_by_email) {
		/* Link Google account to existing user */
		await db.insert(oauth_accounts).values({
			user_id: existing_user_by_email.id,
			provider: "google",
			provider_account_id: google_user.id,
		});
		return existing_user_by_email;
	}

	/* Create new user */
	const [new_user] = await db
		.insert(users)
		.values({
			email: google_user.email,
			name: google_user.name,
			image: google_user.picture,
			auth_provider: "google",
			email_verified: true, /* Google emails are pre-verified */
		})
		.returning();

	/* Create OAuth account link */
	await db.insert(oauth_accounts).values({
		user_id: new_user.id,
		provider: "google",
		provider_account_id: google_user.id,
	});

	return new_user;
};

/* Token expiration times */
const ACCESS_TOKEN_EXPIRES_IN = 15 * 60; /* 15 minutes */
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60; /* 7 days */

/**
 * DOCU: Generates an access token (short-lived) for authenticated user. <br>
 * Triggered: After successful authentication or token refresh. <br>
 * Last Updated: December 10, 2025
 */
export const generateAccessToken = (user_id: string, email: string): string => {
	return jwt.sign({ user_id, email, type: "access" }, config.jwt.secret as string, {
		expiresIn: ACCESS_TOKEN_EXPIRES_IN,
	});
};

/**
 * DOCU: Hashes a token for secure storage in the database. <br>
 * Triggered: When storing or validating refresh tokens. <br>
 * Last Updated: December 10, 2025
 */
const hashToken = (token: string): string => {
	return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * DOCU: Generates a refresh token and stores it in the database. <br>
 * Triggered: After successful authentication. <br>
 * Last Updated: December 10, 2025
 */
export const generateRefreshToken = async (user_id: string, email: string): Promise<string> => {
	/* Generate a unique JWT ID to ensure each token is unique */
	const jti = crypto.randomUUID();

	const token = jwt.sign(
		{ user_id, email, type: "refresh", jti },
		config.jwt.secret as string,
		{ expiresIn: REFRESH_TOKEN_EXPIRES_IN }
	);

	const token_hash = hashToken(token);
	const expires_at = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000);

	/* Store hashed token in database */
	await db.insert(refresh_tokens).values({
		user_id,
		token_hash,
		expires_at,
	});

	return token;
};

/**
 * DOCU: Validates a refresh token against the database. <br>
 * Triggered: When refreshing access token. <br>
 * Returns: Object with user data and reuse flag, or null if invalid. <br>
 * Last Updated: December 10, 2025
 */
export const validateRefreshToken = async (token: string): Promise<{ user_id: string; email: string; is_reuse: boolean } | null> => {
	/* Verify JWT signature and expiration */
	const decoded = verifyToken(token);
	if (!decoded || decoded.type !== "refresh") {
		return null;
	}

	/* Check if token exists in database */
	const token_hash = hashToken(token);
	const stored_token = await db.query.refresh_tokens.findFirst({
		where: eq(refresh_tokens.token_hash, token_hash),
	});

	if (!stored_token) {
		return null;
	}

	/* Check if token was already revoked (possible reuse attack) */
	if (stored_token.revoked_at !== null) {
		return { user_id: decoded.user_id, email: decoded.email, is_reuse: true };
	}

	/* Check if token is expired */
	if (new Date() > stored_token.expires_at) {
		return null;
	}

	return { user_id: decoded.user_id, email: decoded.email, is_reuse: false };
};

/**
 * DOCU: Rotates a refresh token - revokes old one and issues new one. <br>
 * Triggered: When refreshing access token. <br>
 * Last Updated: December 10, 2025
 */
export const rotateRefreshToken = async (old_token: string, user_id: string, email: string): Promise<string | null> => {
	const old_token_hash = hashToken(old_token);

	/* Revoke the old token */
	const [revoked] = await db
		.update(refresh_tokens)
		.set({ revoked_at: new Date() })
		.where(and(
			eq(refresh_tokens.token_hash, old_token_hash),
			isNull(refresh_tokens.revoked_at)
		))
		.returning();

	if (!revoked) {
		/* Token was already revoked or doesn't exist - possible token reuse attack */
		return null;
	}

	/* Generate and store new refresh token */
	return generateRefreshToken(user_id, email);
};

/**
 * DOCU: Revokes all refresh tokens for a user (logout all devices). <br>
 * Triggered: When user wants to log out everywhere. <br>
 * Last Updated: December 10, 2025
 */
export const revokeAllUserTokens = async (user_id: string): Promise<void> => {
	await db
		.update(refresh_tokens)
		.set({ revoked_at: new Date() })
		.where(and(
			eq(refresh_tokens.user_id, user_id),
			isNull(refresh_tokens.revoked_at)
		));
};

/**
 * DOCU: Revokes a specific refresh token. <br>
 * Triggered: When user logs out from current session. <br>
 * Last Updated: December 10, 2025
 */
export const revokeRefreshToken = async (token: string): Promise<void> => {
	const token_hash = hashToken(token);
	await db
		.update(refresh_tokens)
		.set({ revoked_at: new Date() })
		.where(eq(refresh_tokens.token_hash, token_hash));
};

/**
 * DOCU: Verifies and decodes a JWT token. <br>
 * Triggered: When validating access or refresh tokens. <br>
 * Last Updated: December 10, 2025
 */
export const verifyToken = (token: string): { user_id: string; email: string; type: string } | null => {
	try {
		return jwt.verify(token, config.jwt.secret as string) as { user_id: string; email: string; type: string };
	} catch {
		return null;
	}
};

/**
 * DOCU: Cookie configuration for authentication tokens. <br>
 * Last Updated: December 10, 2025
 */
export const getCookieOptions = (max_age_seconds: number) => ({
	httpOnly: true,
	secure: config.nodeEnv === "production",
	sameSite: "strict" as const,
	maxAge: max_age_seconds * 1000, /* Convert to milliseconds */
	path: "/",
});

export const ACCESS_TOKEN_COOKIE_OPTIONS = getCookieOptions(ACCESS_TOKEN_EXPIRES_IN);
export const REFRESH_TOKEN_COOKIE_OPTIONS = getCookieOptions(REFRESH_TOKEN_EXPIRES_IN);

/**
 * DOCU: Fetches a user by ID from the database. <br>
 * Triggered: When getting current user info. <br>
 * Last Updated: December 10, 2025
 */
export const getUserById = async (user_id: string) => {
	return db.query.users.findFirst({
		where: eq(users.id, user_id),
	});
};
