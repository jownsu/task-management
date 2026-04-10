import { z } from "zod";

export const MAX_BOARD_TAGS = 10;
export const MAX_TASK_TAGS = 5;

export const create_tag_schema = z.object({
	board_id: z.string(),
	name: z.string().min(1, "Name is required").max(20, "Name must be 20 characters or less"),
	color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7")
});

export const edit_tag_schema = z.object({
	tag_id: z.string(),
	board_id: z.string(),
	name: z.string().min(1, "Name is required").max(20, "Name must be 20 characters or less"),
	color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
});

export const delete_tag_schema = z.object({
	tag_id: z.string(),
	board_id: z.string()
});

export type CreateTagSchemaType = z.infer<typeof create_tag_schema>;
export type EditTagSchemaType = z.infer<typeof edit_tag_schema>;
export type DeleteTagSchemaType = z.infer<typeof delete_tag_schema>;
