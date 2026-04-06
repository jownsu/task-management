import { z } from "zod";

export const add_column_schema = z.object({
	board_id: z.string(),
	name: z.string().min(1, "Name is required"),
	theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7")
});

export const delete_column_schema = z.object({
	board_id: z.string(),
	column_id: z.string()
});

export type AddColumnSchema = z.infer<typeof add_column_schema>;
export type DeleteColumnSchemaType = z.infer<typeof delete_column_schema>;

