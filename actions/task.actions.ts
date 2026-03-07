"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";

/* SCHEMA */
import { create_task_schema, delete_task_schema, edit_task_schema } from "@/schema/task-schema";

/* TYPES */
import { Subtask } from "@/types";

/**
 * DOCU: Creates a new task with its subtasks in a column. <br>
 * Triggered: On submission of new task form. <br>
 * Last Updated: March 07, 2026
 * @author Jhones
 */
export const createTaskAction = authActionClient
	.schema(create_task_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { title, description, column_id, board_id, sub_tasks } = parsedInput;

		/* Verify that the column belongs to a board owned by the current user */
		const column = await prisma.column.findFirst({
			where: {
				id: column_id,
				board: { id: board_id, userId: ctx.userId }
			}
		});

		if (!column) {
			throw new Error("Column not found");
		}

		const result = await prisma.$transaction(async (tx) => {
			/* Create the task */
			const task = await tx.task.create({
				data: {
					title,
					description,
					columnId: column_id
				}
			});

			/* Create subtasks individually to guarantee order */
			const subtask_ids: string[] = [];
			const subtasks: Subtask[] = [];

			for (const subtask_data of sub_tasks) {
				const subtask = await tx.subtask.create({
					data: {
						title: subtask_data.title,
						taskId: task.id
					}
				});
				subtask_ids.push(subtask.id);
				subtasks.push({
					id: subtask.id,
					title: subtask.title,
					isCompleted: subtask.isCompleted
				});
			}

			/* Set the subtask order on the task */
			await tx.task.update({
				where: { id: task.id },
				data: { subtaskOrder: subtask_ids }
			});

			/* Append the task to the column's taskOrder */
			await tx.column.update({
				where: { id: column_id },
				data: { taskOrder: { push: task.id } }
			});

			return {
				id: task.id,
				title: task.title,
				description: task.description || "",
				subtaskOrder: subtask_ids,
				subtasks
			};
		});

		return result;
	});

/**
 * DOCU: Edits an existing task and its subtasks (create, update, delete). <br>
 * Triggered: On submission of edit task form. <br>
 * Last Updated: March 07, 2026
 * @author Jhones
 */
export const editTaskAction = authActionClient
	.schema(edit_task_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { id, board_id, title, description, sub_tasks } = parsedInput;

		/* Verify the task belongs to a board owned by the current user */
		const task = await prisma.task.findFirst({
			where: {
				id,
				column: { board: { id: board_id, userId: ctx.userId } }
			},
			select: { id: true }
		});

		if (!task) {
			throw new Error("Task not found");
		}

		/* Get existing subtask IDs to determine which ones to delete */
		const existing_subtasks = await prisma.subtask.findMany({
			where: { taskId: id },
			select: { id: true }
		});

		const existing_subtask_ids = existing_subtasks.map((subtask) => subtask.id);
		const payload_subtask_ids = sub_tasks.filter((subtask) => subtask.id && !subtask.is_new).map((subtask) => subtask.id!);
		const subtasks_to_delete = existing_subtask_ids.filter((subtask_id) => !payload_subtask_ids.includes(subtask_id));

		const result = await prisma.$transaction(async (tx) => {
			/* Delete removed subtasks */
			if (subtasks_to_delete.length > 0) {
				await tx.subtask.deleteMany({
					where: { id: { in: subtasks_to_delete } }
				});
			}

			/* Update existing subtasks and create new ones, collect IDs for ordering */
			const subtask_ids: string[] = [];
			const subtasks: Subtask[] = [];

			for (const subtask_data of sub_tasks) {
				if (subtask_data.id && !subtask_data.is_new) {
					const updated = await tx.subtask.update({
						where: { id: subtask_data.id },
						data: { title: subtask_data.title },
						select: { id: true, title: true, isCompleted: true }
					});
					subtask_ids.push(updated.id);
					subtasks.push(updated);
				} else {
					const new_subtask = await tx.subtask.create({
						data: {
							title: subtask_data.title,
							taskId: id
						}
					});
					subtask_ids.push(new_subtask.id);
					subtasks.push({
						id: new_subtask.id,
						title: new_subtask.title,
						isCompleted: new_subtask.isCompleted
					});
				}
			}

			/* Update the task */
			const updated_task = await tx.task.update({
				where: { id },
				data: {
					title,
					description,
					subtaskOrder: subtask_ids
				}
			});

			return {
				id: updated_task.id,
				title: updated_task.title,
				description: updated_task.description || "",
				subtaskOrder: subtask_ids,
				subtasks
			};
		});

		return result;
	});

/**
 * DOCU: Deletes a task and its subtasks from a column. <br>
 * Triggered: On submission of delete task form. <br>
 * Last Updated: March 07, 2026
 * @author Jhones
 */
export const deleteTaskAction = authActionClient
	.schema(delete_task_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { id } = parsedInput;

		/* Verify the task belongs to a board owned by the current user */
		const task = await prisma.task.findFirst({
			where: {
				id,
				column: { board: { userId: ctx.userId } }
			},
			select: { id: true, columnId: true, column: { select: { taskOrder: true } } }
		});

		if (!task) {
			throw new Error("Task not found");
		}

		await prisma.$transaction(async (tx) => {
			/* Delete the task (subtasks cascade) */
			await tx.task.delete({
				where: { id }
			});

			/* Remove the task from the column's taskOrder */
			await tx.column.update({
				where: { id: task.columnId },
				data: { taskOrder: task.column.taskOrder.filter((task_id) => task_id !== id) }
			});
		});
	});
