import { Request, Response, NextFunction } from "express";
import { verifyToken, getUserById } from "@/services/auth-service";
import { config } from "@/config/environment";

/* Cookie name for access token */
const ACCESS_TOKEN_COOKIE = "access_token";

/* Extend Express Request to include user */
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				email: string;
				name: string | null;
				image: string | null;
			};
		}
	}
}

/**
 * DOCU: Middleware that verifies JWT token and attaches user to request. <br>
 * In development with AUTH_BYPASS=true, automatically authenticates as dev user. <br>
 * Triggered: On protected routes. <br>
 * Last Updated: December 10, 2024
 */
export const requireAuth = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		/* Development bypass - skip auth if enabled and user ID configured */
		if (config.isDevelopment && config.auth.bypass && config.auth.bypassUserId) {
			const dev_user = await getUserById(config.auth.bypassUserId);

			if (dev_user) {
				req.user = {
					id: dev_user.id,
					email: dev_user.email,
					name: dev_user.name,
					image: dev_user.image,
				};
				next();
				return;
			}
			/* If no dev user found, fall through to normal auth */
		}

		const access_token = req.cookies[ACCESS_TOKEN_COOKIE];

		if (!access_token) {
			res.status(401).json({
				success: false,
				error: { message: "Authentication required" },
			});
			return;
		}

		const decoded = verifyToken(access_token);

		if (!decoded || decoded.type !== "access") {
			res.status(401).json({
				success: false,
				error: { message: "Invalid or expired token" },
			});
			return;
		}

		const user = await getUserById(decoded.user_id);

		if (!user) {
			res.status(401).json({
				success: false,
				error: { message: "User not found" },
			});
			return;
		}

		/* Attach user to request */
		req.user = {
			id: user.id,
			email: user.email,
			name: user.name,
			image: user.image,
		};

		next();
	} catch (error) {
		console.error("Auth middleware error:", error);
		res.status(500).json({
			success: false,
			error: { message: "Authentication failed" },
		});
	}
};

/**
 * DOCU: Optional auth middleware - attaches user if authenticated, but doesn't block. <br>
 * Triggered: On routes that work with or without auth. <br>
 * Last Updated: December 10, 2024
 */
export const optionalAuth = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		/* Development bypass */
		if (config.isDevelopment && config.auth.bypass && config.auth.bypassUserId) {
			const dev_user = await getUserById(config.auth.bypassUserId);

			if (dev_user) {
				req.user = {
					id: dev_user.id,
					email: dev_user.email,
					name: dev_user.name,
					image: dev_user.image,
				};
			}
			next();
			return;
		}

		const access_token = req.cookies[ACCESS_TOKEN_COOKIE];

		if (access_token) {
			const decoded = verifyToken(access_token);

			if (decoded && decoded.type === "access") {
				const user = await getUserById(decoded.user_id);

				if (user) {
					req.user = {
						id: user.id,
						email: user.email,
						name: user.name,
						image: user.image,
					};
				}
			}
		}

		next();
	} catch (error) {
		/* Don't block on errors for optional auth */
		next();
	}
};
