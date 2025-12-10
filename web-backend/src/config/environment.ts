import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const config = {
	// Server Configuration
	port: process.env.PORT || 3001,
	nodeEnv: process.env.NODE_ENV || "development",

	// CORS Configuration
	corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

	// Rate Limiting
	rateLimit: {
		windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
		maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
	},

	// API Configuration
	api: {
		version: process.env.API_VERSION || "v1",
		prefix: process.env.API_PREFIX || "/api",
	},

	// Database Configuration (for future use)
	database: {
		url: process.env.DATABASE_URL,
		host: process.env.DB_HOST || "localhost",
		port: parseInt(process.env.DB_PORT || "5432"),
		name: process.env.DB_NAME || "task_management",
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
	},

	// JWT Configuration (for future authentication)
	jwt: {
		secret: process.env.JWT_SECRET || "your-secret-key",
		expiresIn: process.env.JWT_EXPIRES_IN || "7d",
	},

	google: {
		clientId: process.env.GOOGLE_CLIENT_ID!,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		redirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:8000/api/auth/google/callback",
	},

	/* Auth Configuration */
	auth: {
		bypass: process.env.AUTH_BYPASS === "true",
		bypassUserId: process.env.DEV_BYPASS_USER_ID,
	},

	/* Helper to check environment */
	isDevelopment: process.env.NODE_ENV === "development",
	isProduction: process.env.NODE_ENV === "production",
	isStaging: process.env.NODE_ENV === "staging",
} as const;

export default config;
