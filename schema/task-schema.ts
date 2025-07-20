import { z } from "zod";

export const task_schema = z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    column_id: z.string(),
    sub_tasks: z.array(z.object({
        id: z.string().optional(),
        title: z.string(),
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

export const delete_task_schema = z.object({
	id: z.string()
});

export type TaskSchemaType = z.infer<typeof task_schema>;
export type DeleteTaskSchemaType = z.infer<typeof delete_task_schema>;
export type ViewTaskSchemaType = z.infer<typeof view_task_schema>;

