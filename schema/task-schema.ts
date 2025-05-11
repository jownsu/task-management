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

export type TaskSchemaType = z.infer<typeof task_schema>;
