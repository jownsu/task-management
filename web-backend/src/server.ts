import express from "express";
import helmet from "helmet";
import compression from "compression";
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

// Initialize Express app
const app = express();
const port = Number(config.port);

// Initialize middlewares
function initializeMiddlewares(): void {
	// Security middleware
	app.use(helmet());

	// Request ID middleware
	app.use(requestId);

	// Logging middleware
	app.use(logger);

	// CORS middleware
	app.use(corsMiddleware);

	// Rate limiting middleware
	app.use(rateLimiter);

	// Compression middleware
	app.use(compression());

	// Body parsing middleware
	app.use(express.json({ limit: "10mb" }));
	app.use(express.urlencoded({ extended: true, limit: "10mb" }));
}

// Initialize routes
function initializeRoutes(): void {
	// Root route
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

	// API routes
	app.use(config.api.prefix, routes);
}

// Initialize error handling
function initializeErrorHandling(): void {
	// 404 handler
	app.use(notFoundHandler);

	// Global error handler
	app.use(errorHandler);
}

// Start server
function startServer(): void {
	app.listen(port, () => {
		console.log(`
🚀 Server is running!
📍 Port: ${port}
🌍 Environment: ${config.nodeEnv}
🔗 API Base URL: http://localhost:${port}${config.api.prefix}
📊 Health Check: http://localhost:${port}/health
✅ Readiness Check: http://localhost:${port}/ready
      `);
	});
}

// Initialize and start the server
initializeMiddlewares();
initializeRoutes();
initializeErrorHandling();
startServer();

export default app;
