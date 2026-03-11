import { z } from "zod";

export const add_column_schema = z.object({
	board_id: z.string(),
	name: z.string().min(1, "Name is required")
});

export const delete_column_schema = z.object({
	board_id: z.string(),
	column_id: z.string()
});

export type AddColumnSchema = z.infer<typeof add_column_schema>;
export type DeleteColumnSchemaType = z.infer<typeof delete_column_schema>;

