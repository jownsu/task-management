import request from "supertest";
import app from "@/app";
import { db } from "@/db";
import { refresh_tokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
	createTestUser,
	createTestTokens,
	parseCookies,
} from "./helpers";

describe("Auth API", () => {
	describe("GET /api/auth/me", () => {
		it("should return 401 when not authenticated", async () => {
			const response = await request(app).get("/api/auth/me");

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.error.message).toBe("Authentication required");
		});

		it("should return user data when authenticated", async () => {
			const user = await createTestUser();
			const { access_token } = await createTestTokens(user.id, user.email);

			const response = await request(app)
				.get("/api/auth/me")
				.set("Cookie", `access_token=${access_token}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.id).toBe(user.id);
			expect(response.body.data.email).toBe(user.email);
			expect(response.body.data.name).toBe(user.name);
		});

		it("should return 401 with invalid token", async () => {
			const response = await request(app)
				.get("/api/auth/me")
				.set("Cookie", "access_token=invalid-token");

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
		});
	});

	describe("POST /api/auth/refresh", () => {
		it("should return 401 when no refresh token", async () => {
			const response = await request(app).post("/api/auth/refresh");

			expect(response.status).toBe(401);
			expect(response.body.error.message).toBe("Refresh token missing");
		});

		it("should refresh tokens and set new cookies", async () => {
			const user = await createTestUser();
			const { refresh_token } = await createTestTokens(user.id, user.email);

			const response = await request(app)
				.post("/api/auth/refresh")
				.set("Cookie", `refresh_token=${refresh_token}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.message).toBe("Token refreshed successfully");

			/* Verify new cookies are set */
			const cookies = parseCookies(response.headers["set-cookie"] as unknown as string[]);
			expect(cookies.access_token).toBeDefined();
			expect(cookies.refresh_token).toBeDefined();
		});

		it("should revoke old refresh token after rotation", async () => {
			const user = await createTestUser();
			const { refresh_token } = await createTestTokens(user.id, user.email);

			/* First refresh should succeed */
			const response1 = await request(app)
				.post("/api/auth/refresh")
				.set("Cookie", `refresh_token=${refresh_token}`);

			expect(response1.status).toBe(200);

			/* Second refresh with same token should fail (already revoked) */
			const response2 = await request(app)
				.post("/api/auth/refresh")
				.set("Cookie", `refresh_token=${refresh_token}`);

			expect(response2.status).toBe(401);
		});

		it("should detect token reuse and revoke all sessions", async () => {
			const user = await createTestUser();
			const { refresh_token } = await createTestTokens(user.id, user.email);

			/* First refresh */
			await request(app)
				.post("/api/auth/refresh")
				.set("Cookie", `refresh_token=${refresh_token}`);

			/* Attempt reuse - should trigger security response */
			const response = await request(app)
				.post("/api/auth/refresh")
				.set("Cookie", `refresh_token=${refresh_token}`);

			expect(response.status).toBe(401);
			expect(response.body.error.message).toContain("Token reuse detected");

			/* Verify all tokens are revoked */
			const active_tokens = await db.query.refresh_tokens.findMany({
				where: eq(refresh_tokens.user_id, user.id),
			});

			const non_revoked = active_tokens.filter((t) => t.revoked_at === null);
			expect(non_revoked.length).toBe(0);
		});
	});

	describe("POST /api/auth/logout", () => {
		it("should clear cookies and revoke refresh token", async () => {
			const user = await createTestUser();
			const { access_token, refresh_token } = await createTestTokens(user.id, user.email);

			const response = await request(app)
				.post("/api/auth/logout")
				.set("Cookie", `access_token=${access_token}; refresh_token=${refresh_token}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.message).toBe("Logged out successfully");

			/* Verify cookies are cleared */
			const cookies = parseCookies(response.headers["set-cookie"] as unknown as string[]);
			expect(cookies.access_token).toBe("");
			expect(cookies.refresh_token).toBe("");
		});

		it("should work even without cookies", async () => {
			const response = await request(app).post("/api/auth/logout");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});
	});

	describe("POST /api/auth/logout-all", () => {
		it("should return 401 when not authenticated", async () => {
			const response = await request(app).post("/api/auth/logout-all");

			expect(response.status).toBe(401);
		});

		it("should revoke all user sessions", async () => {
			const user = await createTestUser();

			/* Create multiple sessions */
			await createTestTokens(user.id, user.email);
			await createTestTokens(user.id, user.email);
			const { access_token } = await createTestTokens(user.id, user.email);

			const response = await request(app)
				.post("/api/auth/logout-all")
				.set("Cookie", `access_token=${access_token}`);

			expect(response.status).toBe(200);
			expect(response.body.data.message).toBe("Logged out from all devices");

			/* Verify all tokens are revoked */
			const active_tokens = await db.query.refresh_tokens.findMany({
				where: eq(refresh_tokens.user_id, user.id),
			});

			const non_revoked = active_tokens.filter((t) => t.revoked_at === null);
			expect(non_revoked.length).toBe(0);
		});
	});

	describe("GET /api/auth/google", () => {
		it("should redirect to Google OAuth", async () => {
			const response = await request(app).get("/api/auth/google");

			expect(response.status).toBe(302);
			expect(response.headers.location).toContain("accounts.google.com");
		});
	});
});
