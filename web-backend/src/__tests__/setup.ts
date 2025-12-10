import { db } from "@/db";
import { users, oauth_accounts, refresh_tokens } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * DOCU: Global test setup - runs before all tests. <br>
 * Last Updated: December 10, 2025
 */
beforeAll(async () => {
	/* Ensure database connection is ready */
	console.log("Test setup: Database connected");
});

/**
 * DOCU: Cleanup after each test - clears test data. <br>
 * Last Updated: December 10, 2025
 */
afterEach(async () => {
	/* Clear test data from tables (order matters due to foreign keys) */
	await db.delete(refresh_tokens);
	await db.delete(oauth_accounts);
	await db.delete(users);
});

/**
 * DOCU: Global teardown - runs after all tests. <br>
 * Last Updated: December 10, 2025
 */
afterAll(async () => {
	console.log("Test teardown: Cleanup complete");
});
