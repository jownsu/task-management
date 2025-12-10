import express from "express";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { config } from "@/config/environment";
import {
	corsMiddleware,
	rateLimiter,
	errorHandler,
	notFoundHandler,
	logger,
	requestId,
} from "@/middleware";
import routes from "@/routes";

/**
 * DOCU: Creates and configures the Express application. <br>
 * Separated from server.ts to allow importing app without starting server (for tests). <br>
 * Last Updated: December 10, 2025
 */
const app = express();

/* Security middleware */
app.use(helmet());

/* Request ID middleware */
app.use(requestId);

/* Logging middleware - skip in test environment */
if (config.nodeEnv !== "test") {
	app.use(logger);
}

/* CORS middleware */
app.use(corsMiddleware);

/* Rate limiting middleware - skip in test environment */
if (config.nodeEnv !== "test") {
	app.use(rateLimiter);
}

/* Compression middleware */
app.use(compression());

/* Body parsing middleware */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* Cookie parser middleware */
app.use(cookieParser());

/* Root route */
app.get("/", (req, res) => {
	res.json({
		success: true,
		message: "Task Management API Server",
		version: config.api.version,
		timestamp: new Date().toISOString(),
		endpoints: {
			health: "/health",
			readiness: "/ready",
			api: config.api.prefix,
		},
	});
});

/* API routes */
app.use(config.api.prefix, routes);

/* 404 handler */
app.use(notFoundHandler);

/* Global error handler */
app.use(errorHandler);

export default app;
