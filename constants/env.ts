/**
 * DOCU: Centralized environment variables configuration. <br>
 * Triggered: Imported throughout the application. <br>
 * Last Updated: December 30, 2024
 * @author Jhones
 */

const getEnvVar = (key: string): string => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
};

export const ENV = {
	DATABASE_URL: getEnvVar("DATABASE_URL"),
	RESEND_API_KEY: getEnvVar("RESEND_API_KEY"),
	NEXT_PUBLIC_APP_URL: getEnvVar("NEXT_PUBLIC_APP_URL"),
	NODE_ENV: process.env.NODE_ENV || "development",
} as const;
