import { z } from "zod";

/* SCHEMA */
import { MAX_BOARD_TAGS } from "@/schema/tag-schema";

export const MAX_COLUMNS = 10;

export const add_board_schema = z.object({
	name: z.string().min(1, "Name is required"),
	columns: z.array(z.object({
		name: z.string().min(1, "Can't be empty"),
		theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
	})).max(MAX_COLUMNS, `You can only have up to ${MAX_COLUMNS} columns`)
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

export type AddBoardSchema = z.infer<typeof add_board_schema>;
export type EditBoardSchema = z.infer<typeof edit_board_schema>;
export type DeleteBoardSchema = z.infer<typeof delete_board_schema>;
export type ReorderBoardSchema = z.infer<typeof reorder_board_schema>;
