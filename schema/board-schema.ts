import { z } from "zod";

/* SCHEMA */
import { MAX_BOARD_TAGS } from "@/schema/tag-schema";

export const MAX_COLUMNS = 10;
export const MAX_HABITS = 10;

export const BOARD_TYPES = ["TASK_MANAGEMENT", "HABIT_TRACKER"] as const;
export const board_type_schema = z.enum(BOARD_TYPES);

export const habit_schema = z.object({
	name: z.string().min(1, "Can't be empty"),
	theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
	goal: z.coerce.number().int().min(0, "Goal must be 0 or more").default(0)
});

export const add_board_schema = z.object({
	name: z.string().min(1, "Name is required"),
	type: board_type_schema.default("TASK_MANAGEMENT"),
	columns: z.array(z.object({
		name: z.string().min(1, "Can't be empty"),
		theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
	})).max(MAX_COLUMNS, `You can only have up to ${MAX_COLUMNS} columns`).optional(),
	habits: z.array(habit_schema).max(MAX_HABITS, `You can only have up to ${MAX_HABITS} habits`).optional()
});

export const edit_board_schema = z.object({
	id: z.string(),
	name: z.string().min(1, "Name is required"),
	columns: z.array(z.object({
		id: z.string().optional(),
		name: z.string().min(1, "Can't be empty"),
		theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
		is_new: z.boolean().default(false).optional()
	})).max(MAX_COLUMNS, `You can only have up to ${MAX_COLUMNS} columns`),
	tags: z.array(z.object({
		id: z.string().optional(),
		name: z.string().min(1, "Can't be empty"),
		color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
		is_new: z.boolean().default(false).optional()
	})).max(MAX_BOARD_TAGS, `You can only have up to ${MAX_BOARD_TAGS} tags`).optional()
});

export const delete_board_schema = z.object({
	id: z.string()
});

export const reorder_board_schema = z.object({
	updated_board_order: z.array(z.string())
});

export type BoardType = z.infer<typeof board_type_schema>;
export type HabitSchema = z.infer<typeof habit_schema>;
export type AddBoardSchema = z.infer<typeof add_board_schema>;
export type EditBoardSchema = z.infer<typeof edit_board_schema>;
export type DeleteBoardSchema = z.infer<typeof delete_board_schema>;
export type ReorderBoardSchema = z.infer<typeof reorder_board_schema>;
