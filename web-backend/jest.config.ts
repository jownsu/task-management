import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.test.ts"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
	clearMocks: true,
	collectCoverageFrom: [
		"src/**/*.ts",
		"!src/**/*.d.ts",
		"!src/__tests__/**",
	],
	coverageDirectory: "coverage",
	verbose: true,
	/*
	 * Transform ESM modules from node_modules that Jest cannot handle.
	 * uuid v9+ and @faker-js/faker are ESM-only packages.
	 */
	transformIgnorePatterns: [
		"node_modules/(?!(uuid|@faker-js/faker)/)",
	],
	transform: {
		/* Transform TypeScript files with ts-jest */
		"^.+\\.tsx?$": "ts-jest",
		/* Transform ESM JavaScript files (like uuid) with ts-jest as well */
		"^.+\\.m?js$": "ts-jest",
	},
};

export default config;
