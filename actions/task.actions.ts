"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";

/* SCHEMA */
import { create_task_schema } from "@/schema/task-schema";

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
