import { z } from "zod";

export const delete_column_schema = z.object({
	board_id: z.string(),
	column_id: z.string()
});

export type DeleteColumnSchemaType = z.infer<typeof delete_column_schema>;

