"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";

/* SCHEMA */
import { create_task_schema } from "@/schema/task-schema";

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

		/* Get the highest task order in the column */
		const { _max } = await prisma.task.aggregate({
			where: { columnId: column_id },
			_max: { order: true }
		});

		const next_order = (_max.order ?? -1) + 1;

		const task = await prisma.task.create({
			data: {
				title,
				description,
				order: next_order,
				columnId: column_id,
				subtasks: {
					create: sub_tasks.map((subtask, index) => ({
						title: subtask.title,
						order: index
					}))
				}
			},
			include: {
				subtasks: {
					orderBy: { order: "asc" }
				}
			}
		});

		return {
			id: task.id,
			title: task.title,
			description: task.description || "",
			order: task.order,
			subtasks: task.subtasks.map((subtask) => ({
				id: subtask.id,
				title: subtask.title,
				isCompleted: subtask.isCompleted,
				order: subtask.order
			}))
		};
	});
