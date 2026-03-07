import { z } from "zod";

export const task_schema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    column_id: z.string(),
    sub_tasks: z.array(z.object({
        id: z.string().optional(),
        title: z.string().min(1, "Can't be empty"),
        is_new: z.boolean().default(false).optional()
    }))
});

export const view_task_schema = z.object({
    id: z.string(),
    sub_tasks: z.array(z.object({
        id: z.string(),
        title: z.string(),
        is_completed: z.boolean()
    })),
    column_id: z.string()
});

export const create_task_schema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	column_id: z.string(),
	board_id: z.string(),
	sub_tasks: z.array(z.object({
		title: z.string().min(1, "Can't be empty")
	}))
});

export const delete_task_schema = z.object({
	id: z.string()
});

export type TaskSchemaType = z.infer<typeof task_schema>;
export type CreateTaskSchemaType = z.infer<typeof create_task_schema>;
export type DeleteTaskSchemaType = z.infer<typeof delete_task_schema>;
export type ViewTaskSchemaType = z.infer<typeof view_task_schema>;

