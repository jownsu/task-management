import { z } from "zod";

export const board_schema = z.object({
	title: z.string(),
	columns: z.array(z.object({
		id: z.number().optional(),
		title: z.string()
	}))
});

export type BoardSchemaType = z.infer<typeof board_schema>;
