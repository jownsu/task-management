/* PLUGINS */
import { relations } from "drizzle-orm";
import {
	timestamp,
	pgTable,
	text,
	primaryKey,
	integer,
	boolean,
	pgEnum
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const RoleEnum = pgEnum("roles", ["user", "admin"]);

/* TABLES */

export const users = pgTable("user", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	email: text("email").unique(),
	emailVerified: timestamp("emailVerified", { mode: "date" }),
	image: text("image"),
	password: text("password"),
	twoFactorEnabled: boolean("twoFactorEnabled").default(false),
	role: RoleEnum("roles").default("user")
});

export const accounts = pgTable(
	"account",
	{
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").$type<AdapterAccount>().notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("providerAccountId").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state")
	},
	(account) => [
		{
			compoundKey: primaryKey({
				columns: [account.provider, account.providerAccountId]
			})
		}
	]
);

export const boards = pgTable("boards", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text("title").notNull(),
	user_id: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" })
});

export const columns = pgTable("columns", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text("title").notNull(),
	board_id: text("board_id")
		.notNull()
		.references(() => boards.id, { onDelete: "cascade" })
});

export const tasks = pgTable("tasks", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text("title").notNull(),
	description: text("description").notNull(),
	column_id: text("column_id")
		.notNull()
		.references(() => columns.id, { onDelete: "cascade" })
});

export const sub_tasks = pgTable("sub_tasks", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text("title").notNull(),
	is_done: boolean("is_done").notNull().default(false),
	task_id: text("task_id")
		.notNull()
		.references(() => tasks.id, { onDelete: "cascade" })
});

/* RELATIONS */
export const user_relations = relations(users, ({ many }) => ({
	boards: many(boards)
}))

export const board_relations = relations(boards, ({ one, many }) => ({
	users: one(users, {
		fields: [boards.user_id],
		references: [users.id]
	}),
	columns: many(columns)
}))

export const column_relations = relations(columns, ({ one, many }) => ({
	board: one(boards, {
		fields: [columns.board_id],
		references: [boards.id]
	}),
	tasks: many(tasks)
}))

export const task_relations = relations(tasks, ({ one, many }) => ({
	column: one(columns, {
		fields: [tasks.column_id],
		references: [columns.id]
	}),
	sub_tasks: many(sub_tasks)
}))

export const sub_task_relations = relations(sub_tasks, ({ one }) => ({
	tasks: one(tasks, {
		fields: [sub_tasks.task_id],
		references: [tasks.id]
	})
}))