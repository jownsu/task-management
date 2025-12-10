import { Request, Response } from "express";
import {
	getGoogleAuthUrl,
	getGoogleUserInfo,
	findOrCreateGoogleUser,
	generateAccessToken,
	generateRefreshToken,
	validateRefreshToken,
	rotateRefreshToken,
	revokeRefreshToken,
	revokeAllUserTokens,
	verifyToken,
	getUserById,
	ACCESS_TOKEN_COOKIE_OPTIONS,
	REFRESH_TOKEN_COOKIE_OPTIONS,
} from "@/services/auth-service";
import { config } from "@/config/environment";

/* Cookie names */
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

/**
 * DOCU: Redirects user to Google OAuth consent screen. <br>
 * Triggered: GET /api/auth/google <br>
 * Last Updated: December 10, 2025
 */
export const googleAuth = (req: Request, res: Response): void => {
	const auth_url = getGoogleAuthUrl();
	res.redirect(auth_url);
};

/**
 * DOCU: Handles Google OAuth callback after user consent. <br>
 * Triggered: GET /api/auth/google/callback <br>
 * Last Updated: December 10, 2025
 */
export const googleCallback = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { code } = req.query;

		if (!code || typeof code !== "string") {
			res.status(400).json({
				success: false,
				error: { message: "Authorization code missing" },
			});
			return;
		}

		/* Exchange code for user info */
		const google_user = await getGoogleUserInfo(code);

		/* Find or create user in database */
		const user = await findOrCreateGoogleUser(google_user);

		if (!user) {
			res.status(500).json({
				success: false,
				error: { message: "Failed to create user" },
			});
			return;
		}

		/* Generate tokens */
		const access_token = generateAccessToken(user.id, user.email);
		const refresh_token = await generateRefreshToken(user.id, user.email);

		/* Set httpOnly cookies */
		res.cookie(ACCESS_TOKEN_COOKIE, access_token, ACCESS_TOKEN_COOKIE_OPTIONS);
		res.cookie(REFRESH_TOKEN_COOKIE, refresh_token, REFRESH_TOKEN_COOKIE_OPTIONS);

		/* Redirect to frontend */
		res.redirect(config.corsOrigin as string);
	} catch (error) {
		console.error("Google OAuth callback error:", error);
		res.status(500).json({
			success: false,
			error: { message: "Authentication failed" },
		});
	}
};

/**
 * DOCU: Returns current authenticated user info. <br>
 * Triggered: GET /api/auth/me <br>
 * Requires: requireAuth middleware <br>
 * Last Updated: December 10, 2025
 */
export const getCurrentUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		/* User is attached by requireAuth middleware */
		const user = await getUserById(req.user!.id);

		if (!user) {
			res.status(404).json({
				success: false,
				error: { message: "User not found" },
			});
			return;
		}

		/* Return user data without sensitive fields */
		res.json({
			success: true,
			data: {
				id: user.id,
				email: user.email,
				name: user.name,
				image: user.image,
				email_verified: user.email_verified,
				auth_provider: user.auth_provider,
				created_at: user.created_at,
			},
		});
	} catch (error) {
		console.error("Get current user error:", error);
		res.status(500).json({
			success: false,
			error: { message: "Failed to get user" },
		});
	}
};

/**
 * DOCU: Refreshes the access token using the refresh token with rotation. <br>
 * Triggered: POST /api/auth/refresh <br>
 * Last Updated: December 10, 2025
 */
export const refreshToken = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const old_refresh_token = req.cookies[REFRESH_TOKEN_COOKIE];

		if (!old_refresh_token) {
			res.status(401).json({
				success: false,
				error: { message: "Refresh token missing" },
			});
			return;
		}

		/* Validate refresh token against database */
		const token_data = await validateRefreshToken(old_refresh_token);

		if (!token_data) {
			/* Clear cookies if token is invalid */
			res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
			res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });

			res.status(401).json({
				success: false,
				error: { message: "Invalid or expired refresh token" },
			});
			return;
		}

		/* Check for token reuse attack */
		if (token_data.is_reuse) {
			/* Token was already revoked - this is a reuse attack */
			await revokeAllUserTokens(token_data.user_id);

			res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
			res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });

			res.status(401).json({
				success: false,
				error: { message: "Token reuse detected. All sessions revoked." },
			});
			return;
		}

		/* Verify user still exists */
		const user = await getUserById(token_data.user_id);

		if (!user) {
			res.status(401).json({
				success: false,
				error: { message: "User not found" },
			});
			return;
		}

		/* Rotate refresh token (revoke old, issue new) */
		const new_refresh_token = await rotateRefreshToken(old_refresh_token, user.id, user.email);

		if (!new_refresh_token) {
			/* This should not happen with valid token, but handle gracefully */
			res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
			res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });

			res.status(401).json({
				success: false,
				error: { message: "Failed to rotate token" },
			});
			return;
		}

		/* Generate new access token */
		const new_access_token = generateAccessToken(user.id, user.email);

		/* Set new cookies */
		res.cookie(ACCESS_TOKEN_COOKIE, new_access_token, ACCESS_TOKEN_COOKIE_OPTIONS);
		res.cookie(REFRESH_TOKEN_COOKIE, new_refresh_token, REFRESH_TOKEN_COOKIE_OPTIONS);

		res.json({
			success: true,
			data: { message: "Token refreshed successfully" },
		});
	} catch (error) {
		console.error("Refresh token error:", error);
		res.status(500).json({
			success: false,
			error: { message: "Failed to refresh token" },
		});
	}
};

/**
 * DOCU: Logs out user by clearing auth cookies and revoking refresh token. <br>
 * Triggered: POST /api/auth/logout <br>
 * Last Updated: December 10, 2025
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
	try {
		const refresh_token = req.cookies[REFRESH_TOKEN_COOKIE];

		/* Revoke the refresh token in database */
		if (refresh_token) {
			await revokeRefreshToken(refresh_token);
		}

		/* Clear both cookies */
		res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
		res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });

		res.json({
			success: true,
			data: { message: "Logged out successfully" },
		});
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({
			success: false,
			error: { message: "Failed to logout" },
		});
	}
};

/**
 * DOCU: Logs out user from all devices by revoking all refresh tokens. <br>
 * Triggered: POST /api/auth/logout-all <br>
 * Requires: requireAuth middleware <br>
 * Last Updated: December 10, 2025
 */
export const logoutAll = async (req: Request, res: Response): Promise<void> => {
	try {
		/* User is attached by requireAuth middleware */
		await revokeAllUserTokens(req.user!.id);

		/* Clear cookies on current device */
		res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
		res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });

		res.json({
			success: true,
			data: { message: "Logged out from all devices" },
		});
	} catch (error) {
		console.error("Logout all error:", error);
		res.status(500).json({
			success: false,
			error: { message: "Failed to logout from all devices" },
		});
	}
};
