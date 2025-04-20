import { z } from "zod";

export const board_schema = z.object({
	name: z.string(),
	columns: z.array(z.object({
		id: z.number().optional(),
		name: z.string()
	}))
});

export type BoardSchemaType = z.infer<typeof board_schema>;
