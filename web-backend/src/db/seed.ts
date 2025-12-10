import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users } from "./schema";
import { eq } from "drizzle-orm";

/**
 * DOCU: Database seed script for development environment. <br>
 * Creates a dev user for auth bypass functionality. <br>
 * Run with: npm run db:seed <br>
 * Last Updated: December 10, 2025
 */

const DEV_USER = {
	id: "00000000-0000-0000-0000-000000000001",
	email: "dev@localhost.test",
	name: "Dev User",
	auth_provider: "email" as const,
	email_verified: true,
};

async function seed() {
	const database_url = process.env.DATABASE_URL;

	if (!database_url) {
		console.error("❌ DATABASE_URL not found in environment");
		process.exit(1);
	}

	console.log("🌱 Starting database seed...\n");

	const sql = neon(database_url);
	const db = drizzle({ client: sql });

	try {
		/* Check if dev user already exists */
		const existing_user = await db
			.select()
			.from(users)
			.where(eq(users.id, DEV_USER.id))
			.limit(1);

		if (existing_user.length > 0) {
			console.log("✅ Dev user already exists:");
			console.log(`   ID: ${DEV_USER.id}`);
			console.log(`   Email: ${DEV_USER.email}`);
			console.log("\n🌱 Seed complete - no changes made");
			return;
		}

		/* Create dev user */
		await db.insert(users).values(DEV_USER);

		console.log("✅ Dev user created:");
		console.log(`   ID: ${DEV_USER.id}`);
		console.log(`   Email: ${DEV_USER.email}`);
		console.log(`   Name: ${DEV_USER.name}`);
		console.log("\n🌱 Seed complete!");
		console.log("\n📝 Add this to your .env for auth bypass:");
		console.log(`   DEV_BYPASS_USER_ID=${DEV_USER.id}`);
	} catch (error) {
		console.error("❌ Seed failed:", error);
		process.exit(1);
	}
}

seed();
