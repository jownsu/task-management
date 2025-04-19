import { z } from "zod";

export const create_board_schema = z.object({
	name: z.string(),
	columns: z.array(z.object({
		id: z.number().optional(),
		name: z.string()
	}))
});

export type CreateBoard = z.infer<typeof create_board_schema>;
