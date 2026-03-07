import { z } from "zod";

export const MAX_COLUMNS = 10;

export const add_board_schema = z.object({
	name: z.string().min(1, "Name is required"),
	columns: z.array(z.object({
		name: z.string().min(1, "Can't be empty"),
	})).max(MAX_COLUMNS, `You can only have up to ${MAX_COLUMNS} columns`)
});

export const edit_board_schema = z.object({
	id: z.string(),
	name: z.string().min(1, "Name is required"),
	columns: z.array(z.object({
		id: z.string().optional(),
		name: z.string().min(1, "Can't be empty"),
		is_new: z.boolean().default(false).optional()
	})).max(MAX_COLUMNS, `You can only have up to ${MAX_COLUMNS} columns`)
});

export const delete_board_schema = z.object({
	id: z.string()
});

export type AddBoardSchema = z.infer<typeof add_board_schema>;
export type EditBoardSchema = z.infer<typeof edit_board_schema>;
export type DeleteBoardSchema = z.infer<typeof delete_board_schema>;
