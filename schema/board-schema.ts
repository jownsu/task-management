import { z } from "zod";

export const board_schema = z.object({
	id: z.string().optional(),
	title: z.string(),
	columns: z.array(z.object({
		id: z.string().optional(),
		title: z.string(),
		is_new: z.boolean().default(false).optional()
	}))
});

export const delete_board_schema = z.object({
	id: z.string()
});

export type BoardSchemaType = z.infer<typeof board_schema>;
export type DeleteBoardSchemaType = z.infer<typeof delete_board_schema>;
