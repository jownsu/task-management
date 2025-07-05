import { z } from "zod";

/* TODO: Delete this */
export const board_schema = z.object({
	id: z.string().optional(),
	title: z.string(),
	columns: z.array(z.object({
		id: z.string().optional(),
		title: z.string(),
		is_new: z.boolean().default(false).optional()
	}))
});

export const add_board_schema = z.object({
	title: z.string(),
	columns: z.array(z.object({
		title: z.string(),
	}))
});

export const delete_board_schema = z.object({
	id: z.string()
});

export type BoardSchemaType = z.infer<typeof board_schema>;
export type AddBoardSchema = z.infer<typeof add_board_schema>;
export type DeleteBoardSchemaType = z.infer<typeof delete_board_schema>;
