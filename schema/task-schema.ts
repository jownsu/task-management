import { z } from "zod";

export const MAX_SUBTASKS = 10;

export const task_schema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    column_id: z.string(),
    sub_tasks: z.array(z.object({
        id: z.string().optional(),
        title: z.string().min(1, "Can't be empty"),
        is_new: z.boolean().default(false).optional()
    })).max(MAX_SUBTASKS, `You can only have up to ${MAX_SUBTASKS} subtasks`)
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
	})).max(MAX_SUBTASKS, `You can only have up to ${MAX_SUBTASKS} subtasks`)
});

export const edit_task_schema = z.object({
	id: z.string(),
	board_id: z.string(),
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	sub_tasks: z.array(z.object({
		id: z.string().optional(),
		title: z.string().min(1, "Can't be empty"),
		is_new: z.boolean().default(false).optional()
	})).max(MAX_SUBTASKS, `You can only have up to ${MAX_SUBTASKS} subtasks`)
});

export const delete_task_schema = z.object({
	id: z.string()
});

export const update_subtask_schema = z.object({
	board_id: z.string(),
	column_id: z.string(),
	task_id: z.string(),
	subtask_id: z.string(),
	isCompleted: z.boolean()
});

export type TaskSchemaType = z.infer<typeof task_schema>;
export type CreateTaskSchemaType = z.infer<typeof create_task_schema>;
export type EditTaskSchemaType = z.infer<typeof edit_task_schema>;
export type DeleteTaskSchemaType = z.infer<typeof delete_task_schema>;
export type ViewTaskSchemaType = z.infer<typeof view_task_schema>;
export type UpdateSubtaskSchemaType = z.infer<typeof update_subtask_schema>;

export const update_task_column_schema = z.object({
	board_id: z.string(),
	task_id: z.string(),
	old_column_id: z.string(),
	new_column_id: z.string()
});

export type UpdateTaskColumnSchemaType = z.infer<typeof update_task_column_schema>;

export const reorder_task_schema = z.object({
	board_id: z.string(),
	task_id: z.string(),
	updated_column_id: z.string(),
	updated_task_order: z.array(z.string())
});

export type ReorderTaskSchemaType = z.infer<typeof reorder_task_schema>;

