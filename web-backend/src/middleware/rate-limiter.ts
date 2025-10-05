import rateLimit from "express-rate-limit";
import { config } from "@/config/environment";

export const rateLimiter = rateLimit({
	windowMs: config.rateLimit.windowMs,
	max: config.rateLimit.maxRequests,
	message: {
		error: "Too many requests from this IP, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});
