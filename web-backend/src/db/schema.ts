import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const authProviderEnum = pgEnum("auth_provider", ["email", "google"]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name"),
    password: text("password"),
    auth_provider: authProviderEnum("auth_provider").notNull(),
    email_verified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const email_verification_tokens = pgTable("email_verification_tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expires_at: timestamp("expires_at").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

export const oauth_accounts = pgTable("oauth_accounts", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    provider_account_id: text("provider_account_id").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

/* Refresh tokens table - stores active refresh tokens for session management */
export const refresh_tokens = pgTable("refresh_tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token_hash: text("token_hash").notNull().unique(), /* Hashed token for security */
    expires_at: timestamp("expires_at").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    revoked_at: timestamp("revoked_at"), /* Set when token is revoked */
});