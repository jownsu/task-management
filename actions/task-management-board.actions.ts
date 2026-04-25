"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";
import { sortByIdOrder } from "@/lib/helpers";

/* SCHEMA */
import { edit_board_schema } from "@/schema/board-schema";

/* TYPES */
import { Board } from "@/types";

/**
 * DOCU: Edits a task-management board and its columns and tags for the current user. <br>
 * Triggered: On submission of edit board form for a TASK_MANAGEMENT board. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export const editTaskManagementBoard = authActionClient
	.schema(edit_board_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { id, name, columns, tags } = parsedInput;

		/* Get existing column IDs to determine which ones to delete */
		const existing_columns = await prisma.column.findMany({
			where: { boardId: id },
			select: { id: true }
		});

		const existing_column_ids = existing_columns.map((column) => column.id);
		const payload_column_ids = columns.filter((column) => column.id && !column.is_new).map((column) => column.id!);
		const columns_to_delete = existing_column_ids.filter((column_id) => !payload_column_ids.includes(column_id));

		/* Get existing tag IDs to determine which ones to delete */
		const existing_tags = await prisma.tag.findMany({
			where: { boardId: id },
			select: { id: true }
		});

		const existing_tag_ids = existing_tags.map((tag) => tag.id);
		const payload_tag_ids = (tags || []).filter((tag) => tag.id && !tag.is_new).map((tag) => tag.id!);
		const tags_to_delete = existing_tag_ids.filter((tag_id) => !payload_tag_ids.includes(tag_id));

		const board = await prisma.$transaction(async (tx) => {
			/* Delete removed columns */
			if (columns_to_delete.length > 0) {
				await tx.column.deleteMany({
					where: { id: { in: columns_to_delete } }
				});
			}

			/* Delete removed tags */
			if (tags_to_delete.length > 0) {
				await tx.tag.deleteMany({
					where: { id: { in: tags_to_delete } }
				});
			}

			/* Update existing columns and create new ones, collect IDs for ordering */
			const column_ids: string[] = [];

			for (const column of columns) {
				if (column.id && !column.is_new) {
					await tx.column.update({
						where: { id: column.id },
						data: { name: column.name, theme: column.theme }
					});
					column_ids.push(column.id);
				} else {
					const new_column = await tx.column.create({
						data: { name: column.name, theme: column.theme, boardId: id }
					});
					column_ids.push(new_column.id);
				}
			}

			/* Update existing tags and create new ones */
			for (const tag of tags || []) {
				if (tag.id && !tag.is_new) {
					await tx.tag.update({
						where: { id: tag.id },
						data: { name: tag.name.trim(), color: tag.color }
					});
				} else {
					await tx.tag.create({
						data: { name: tag.name.trim(), color: tag.color, boardId: id }
					});
				}
			}

			/* Update board name and column order, return full board with columns + tags */
			return tx.board.update({
				where: { id, userId: ctx.userId },
				data: { name, columnOrder: column_ids },
				include: {
					tags: true,
					columns: {
						include: {
							tasks: {
								include: {
									subtasks: true,
									tags: {
										include: {
											tag: true
										}
									}
								}
							}
						}
					}
				}
			});
		});

		return {
			id: board.id,
			name: board.name,
			type: board.type,
			columnOrder: board.columnOrder,
			habitOrder: board.habitOrder,
			tags: board.tags.map((tag) => ({
				id: tag.id,
				name: tag.name,
				color: tag.color
			})),
			columns: sortByIdOrder(board.columns, board.columnOrder).map((column) => ({
				id: column.id,
				name: column.name,
				theme: column.theme,
				taskOrder: column.taskOrder,
				tasks: sortByIdOrder(column.tasks, column.taskOrder).map((task) => ({
					id: task.id,
					title: task.title,
					isCompleted: task.isCompleted,
					description: task.description || "",
					subtaskOrder: task.subtaskOrder,
					subtasks: sortByIdOrder(task.subtasks, task.subtaskOrder).map((subtask) => ({
						id: subtask.id,
						title: subtask.title,
						isCompleted: subtask.isCompleted
					})),
					tags: task.tags.map((task_tag) => ({
						id: task_tag.tag.id,
						name: task_tag.tag.name,
						color: task_tag.tag.color
					}))
				}))
			}))
		};
	});

/**
 * DOCU: Fetches a single task-management board with all its columns, tasks, subtasks, and tags. <br>
 * Triggered: When loading a task-management board detail page. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export async function getTaskManagementBoardById(board_id: string): Promise<Board | null> {
	const board = await prisma.board.findUnique({
		where: { id: board_id, type: "TASK_MANAGEMENT" },
		include: {
			tags: true,
			columns: {
				include: {
					tasks: {
						include: {
							subtasks: true,
							tags: {
								include: {
									tag: true
								}
							}
						}
					}
				}
			}
		}
	});

	if (!board) return null;

	return {
		id: board.id,
		name: board.name,
		type: board.type,
		columnOrder: board.columnOrder,
		habitOrder: board.habitOrder,
		tags: board.tags.map((tag) => ({
			id: tag.id,
			name: tag.name,
			color: tag.color
		})),
		columns: sortByIdOrder(board.columns, board.columnOrder).map((column) => ({
			id: column.id,
			name: column.name,
			theme: column.theme,
			taskOrder: column.taskOrder,
			tasks: sortByIdOrder(column.tasks, column.taskOrder).map((task) => ({
				id: task.id,
				title: task.title,
				isCompleted: task.isCompleted,
				description: task.description || "",
				subtaskOrder: task.subtaskOrder,
				subtasks: sortByIdOrder(task.subtasks, task.subtaskOrder).map((subtask) => ({
					id: subtask.id,
					title: subtask.title,
					isCompleted: subtask.isCompleted
				})),
				tags: task.tags.map((task_tag) => ({
					id: task_tag.tag.id,
					name: task_tag.tag.name,
					color: task_tag.tag.color
				}))
			}))
		}))
	};
}
