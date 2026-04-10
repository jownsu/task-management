"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";

/* SCHEMA */
import { add_subtask_schema, create_task_schema, delete_task_schema, edit_task_schema, mark_all_subtasks_complete_schema, MAX_SUBTASKS, reorder_subtask_schema, reorder_task_schema, toggle_task_complete_schema, update_subtask_schema, update_task_column_schema } from "@/schema/task-schema";

/* TYPES */
import { Subtask } from "@/types";

/**
 * DOCU: Creates a new task with its subtasks in a column. <br>
 * Triggered: On submission of new task form. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export const createTaskAction = authActionClient
	.schema(create_task_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { title, description, column_id, board_id, sub_tasks, tag_ids } = parsedInput;

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

			/* Create tag associations */
			const tags: { id: string; name: string; color: string }[] = [];

			if (tag_ids && tag_ids.length > 0) {
				await tx.taskTag.createMany({
					data: tag_ids.map((tag_id) => ({
						taskId: task.id,
						tagId: tag_id
					}))
				});

				const tag_records = await tx.tag.findMany({
					where: { id: { in: tag_ids } },
					select: { id: true, name: true, color: true }
				});

				tags.push(...tag_records);
			}

			/* Append the task to the column's taskOrder */
			await tx.column.update({
				where: { id: column_id },
				data: { taskOrder: { push: task.id } }
			});

			return {
				id: task.id,
				title: task.title,
				isCompleted: task.isCompleted,
				description: task.description || "",
				subtaskOrder: subtask_ids,
				subtasks,
				tags
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
		const { id, board_id, title, description, sub_tasks, tag_ids } = parsedInput;

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

			/* Sync tag associations: delete all existing, re-insert submitted */
			await tx.taskTag.deleteMany({
				where: { taskId: id }
			});

			const tags: { id: string; name: string; color: string }[] = [];

			if (tag_ids && tag_ids.length > 0) {
				await tx.taskTag.createMany({
					data: tag_ids.map((tag_id) => ({
						taskId: id,
						tagId: tag_id
					}))
				});

				const tag_records = await tx.tag.findMany({
					where: { id: { in: tag_ids } },
					select: { id: true, name: true, color: true }
				});

				tags.push(...tag_records);
			}

			return {
				id: updated_task.id,
				title: updated_task.title,
				description: updated_task.description || "",
				subtaskOrder: subtask_ids,
				subtasks,
				tags
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

/**
 * DOCU: Updates the completion status of a subtask. Auto-completes the parent task when all subtasks are done. <br>
 * Triggered: On toggling a subtask checkbox in view task modal. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export const updateSubtaskAction = authActionClient
	.schema(update_subtask_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { subtask_id, task_id, board_id, isCompleted } = parsedInput;

		/* Verify the subtask belongs to a task in a board owned by the current user */
		const subtask = await prisma.subtask.findFirst({
			where: {
				id: subtask_id,
				taskId: task_id,
				task: { column: { board: { id: board_id, userId: ctx.userId } } }
			},
			select: { id: true }
		});

		if (!subtask) {
			throw new Error("Subtask not found");
		}

		const updated_subtask = await prisma.subtask.update({
			where: { id: subtask_id },
			data: { isCompleted },
			select: { id: true, title: true, isCompleted: true }
		});

		/* Auto-complete task if all subtasks are now completed */
		if (isCompleted) {
			const incomplete_count = await prisma.subtask.count({
				where: { taskId: task_id, isCompleted: false }
			});

			if (incomplete_count === 0) {
				await prisma.task.update({
					where: { id: task_id },
					data: { isCompleted: true }
				});
			}
		}

		return updated_subtask;
	});

/**
 * DOCU: Moves a task from one column to another. <br>
 * Triggered: On changing the column dropdown in view task modal. <br>
 * Last Updated: March 09, 2026
 * @author Jhones
 */
export const updateTaskColumnAction = authActionClient
	.schema(update_task_column_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { task_id, board_id, old_column_id, new_column_id } = parsedInput;

		if (old_column_id === new_column_id) return;

		/* Verify ownership and fetch source column's taskOrder in parallel */
		const [task, target_column] = await Promise.all([
			prisma.task.findFirst({
				where: {
					id: task_id,
					columnId: old_column_id,
					column: { board: { id: board_id, userId: ctx.userId } }
				},
				select: { id: true, column: { select: { taskOrder: true } } }
			}),
			prisma.column.findFirst({
				where: {
					id: new_column_id,
					boardId: board_id,
					board: { userId: ctx.userId }
				},
				select: { id: true }
			})
		]);

		if (!task) {
			throw new Error("Task not found");
		}

		if (!target_column) {
			throw new Error("Target column not found");
		}

		await prisma.$transaction(async (tx) => {
			/* Move the task to the new column */
			await tx.task.update({
				where: { id: task_id },
				data: { columnId: new_column_id }
			});

			/* Remove task from old column's taskOrder */
			await tx.column.update({
				where: { id: old_column_id },
				data: { taskOrder: task.column.taskOrder.filter((id) => id !== task_id) }
			});

			/* Append task to new column's taskOrder */
			await tx.column.update({
				where: { id: new_column_id },
				data: { taskOrder: { push: task_id } }
			});
		});
	});

/**
 * DOCU: Reorders tasks within a column or moves a task across columns by updating taskOrder arrays. <br>
 * Triggered: When a task is dropped after dragging in the board view. <br>
 * Last Updated: March 20, 2026
 * @author Jhones
 */
export const reorderTaskAction = authActionClient
	.schema(reorder_task_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { board_id, task_id, updated_column_id, updated_task_order } = parsedInput;

		/* Verify the task belongs to a board owned by the current user */
		const task = await prisma.task.findFirst({
			where: {
				id: task_id,
				column: { board: { id: board_id, userId: ctx.userId } }
			},
			select: { id: true, columnId: true, column: { select: { taskOrder: true } } }
		});

		if (!task) {
			throw new Error("Task not found");
		}

		/* Same-column reorder */
		if (task.columnId === updated_column_id) {
			await prisma.column.update({
				where: { id: updated_column_id },
				data: { taskOrder: updated_task_order }
			});
			return;
		}

		/* Verify the target column belongs to the same board */
		const target_column = await prisma.column.findFirst({
			where: {
				id: updated_column_id,
				boardId: board_id,
				board: { userId: ctx.userId }
			},
			select: { id: true }
		});

		if (!target_column) {
			throw new Error("Target column not found");
		}

		/* Cross-column move */
		await prisma.$transaction(async (tx) => {
			/* Move the task to the new column */
			await tx.task.update({
				where: { id: task_id },
				data: { columnId: updated_column_id }
			});

			/* Remove task from old column's taskOrder */
			await tx.column.update({
				where: { id: task.columnId },
				data: { taskOrder: task.column.taskOrder.filter((id) => id !== task_id) }
			});

			/* Set the new column's taskOrder */
			await tx.column.update({
				where: { id: updated_column_id },
				data: { taskOrder: updated_task_order }
			});
		});
	});

/**
 * DOCU: Reorders subtasks within a task by updating the subtaskOrder array. <br>
 * Triggered: When a subtask is dropped after dragging in the view task modal. <br>
 * Last Updated: April 05, 2026
 * @author Jhones
 */
export const reorderSubtaskAction = authActionClient
	.schema(reorder_subtask_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { board_id, task_id, updated_subtask_order } = parsedInput;

		/* Verify the task belongs to a board owned by the current user */
		const task = await prisma.task.findFirst({
			where: {
				id: task_id,
				column: { board: { id: board_id, userId: ctx.userId } }
			},
			select: { id: true }
		});

		if (!task) {
			throw new Error("Task not found");
		}

		await prisma.task.update({
			where: { id: task_id },
			data: { subtaskOrder: updated_subtask_order }
		});
	});

/**
 * DOCU: Creates a single subtask and appends it to the task's subtaskOrder. <br>
 * Triggered: On submission of quick-add subtask input in view task modal. <br>
 * Last Updated: April 07, 2026
 * @author Jhones
 */
export const addSubtaskAction = authActionClient
	.schema(add_subtask_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { board_id, task_id, title } = parsedInput;

		/* Verify the task belongs to a board owned by the current user */
		const task = await prisma.task.findFirst({
			where: {
				id: task_id,
				column: { board: { id: board_id, userId: ctx.userId } }
			},
			select: { id: true, _count: { select: { subtasks: true } } }
		});

		if (!task) {
			throw new Error("Task not found");
		}

		if (task._count.subtasks >= MAX_SUBTASKS) {
			throw new Error("Maximum number of subtasks reached");
		}

		const result = await prisma.$transaction(async (tx) => {
			/* Create the subtask */
			const subtask = await tx.subtask.create({
				data: {
					title,
					taskId: task_id
				}
			});

			/* Append to the task's subtaskOrder */
			await tx.task.update({
				where: { id: task_id },
				data: { subtaskOrder: { push: subtask.id } }
			});

			return {
				id: subtask.id,
				title: subtask.title,
				isCompleted: subtask.isCompleted
			};
		});

		return result;
	});

/**
 * DOCU: Marks all subtasks of a task as completed in a single batch update. <br>
 * Triggered: On clicking the "Mark all as done" button in the view task modal. <br>
 * Last Updated: April 08, 2026
 * @author Jhones
 */
export const markAllSubtasksCompleteAction = authActionClient
	.schema(mark_all_subtasks_complete_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { board_id, task_id } = parsedInput;

		/* Verify the task belongs to a board owned by the current user */
		const task = await prisma.task.findFirst({
			where: {
				id: task_id,
				column: { board: { id: board_id, userId: ctx.userId } }
			},
			select: { id: true }
		});

		if (!task) {
			throw new Error("Task not found");
		}

		await prisma.$transaction(async (tx) => {
			await tx.subtask.updateMany({
				where: { taskId: task_id },
				data: { isCompleted: true }
			});

			await tx.task.update({
				where: { id: task_id },
				data: { isCompleted: true }
			});
		});
	});

/**
 * DOCU: Toggles the completion status of a task. <br>
 * Triggered: On clicking the task completion toggle in the task card or view task modal. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export const toggleTaskCompleteAction = authActionClient
	.schema(toggle_task_complete_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { board_id, task_id, isCompleted } = parsedInput;

		/* Verify the task belongs to a board owned by the current user */
		const task = await prisma.task.findFirst({
			where: {
				id: task_id,
				column: { board: { id: board_id, userId: ctx.userId } }
			},
			select: { id: true }
		});

		if (!task) {
			throw new Error("Task not found");
		}

		await prisma.task.update({
			where: { id: task_id },
			data: { isCompleted }
		});
	});
