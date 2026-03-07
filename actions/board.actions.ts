"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient, getAuthUser } from "@/lib/safe-action";
import { sortByIdOrder } from "@/lib/helpers";

/* SCHEMA */
import { add_board_schema, delete_board_schema, edit_board_schema } from "@/schema/board-schema";

/* TYPES */
import { Board } from "@/types";

/**
 * DOCU: Fetches all boards for the current user from the database. <br>
 * Triggered: When loading the sidebar or boards list. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export async function getAllBoards(): Promise<Omit<Board, "columns" | "columnOrder">[]> {
	const user = await getAuthUser();

	const boards = await prisma.board.findMany({
		where: {
			userId: user.id
		},
		select: {
			id: true,
			name: true
		},
		orderBy: {
			createdAt: "asc"
		}
	});

	return boards;
}

/**
 * DOCU: Creates a new board with its columns for the current user. <br>
 * Triggered: On submission of new board form. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export const createBoardAction = authActionClient
	.schema(add_board_schema)
	.action(async ({ parsedInput, ctx }) => {
		const board = await prisma.$transaction(async (tx) => {
			/* Create the board with its columns */
			const new_board = await tx.board.create({
				data: {
					name: parsedInput.name,
					userId: ctx.userId,
					columns: {
						create: parsedInput.columns.map((column) => ({ name: column.name }))
					}
				},
				include: {
					columns: { select: { id: true }, orderBy: { createdAt: "asc" } }
				}
			});

			/* Set the column order on the board */
			return tx.board.update({
				where: { id: new_board.id },
				data: { columnOrder: new_board.columns.map((column) => column.id) },
				select: {
					id: true,
					name: true,
					columnOrder: true
				}
			});
		});

		return board;
	});

/**
 * DOCU: Edits a board and its columns (create, update, delete) for the current user. <br>
 * Triggered: On submission of edit board form. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export const editBoardAction = authActionClient
	.schema(edit_board_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { id, name, columns } = parsedInput;

		/* Get existing column IDs to determine which ones to delete */
		const existing_columns = await prisma.column.findMany({
			where: { boardId: id },
			select: { id: true }
		});

		const existing_column_ids = existing_columns.map((column) => column.id);
		const payload_column_ids = columns.filter((column) => column.id && !column.is_new).map((column) => column.id!);
		const columns_to_delete = existing_column_ids.filter((column_id) => !payload_column_ids.includes(column_id));

		const board = await prisma.$transaction(async (tx) => {
			/* Delete removed columns */
			if (columns_to_delete.length > 0) {
				await tx.column.deleteMany({
					where: { id: { in: columns_to_delete } }
				});
			}

			/* Update existing columns and create new ones, collect IDs for ordering */
			const column_ids: string[] = [];

			for (const column of columns) {
				if (column.id && !column.is_new) {
					await tx.column.update({
						where: { id: column.id },
						data: { name: column.name }
					});
					column_ids.push(column.id);
				} else {
					const new_column = await tx.column.create({
						data: { name: column.name, boardId: id }
					});
					column_ids.push(new_column.id);
				}
			}

			/* Update board name, column order, and return full board */
			return tx.board.update({
				where: { id, userId: ctx.userId },
				data: { name, columnOrder: column_ids },
				include: {
					columns: {
						include: {
							tasks: {
								include: {
									subtasks: true
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
			columnOrder: board.columnOrder,
			columns: sortByIdOrder(board.columns, board.columnOrder).map((column) => ({
				id: column.id,
				name: column.name,
				taskOrder: column.taskOrder,
				tasks: sortByIdOrder(column.tasks, column.taskOrder).map((task) => ({
					id: task.id,
					title: task.title,
					description: task.description || "",
					subtaskOrder: task.subtaskOrder,
					subtasks: sortByIdOrder(task.subtasks, task.subtaskOrder).map((subtask) => ({
						id: subtask.id,
						title: subtask.title,
						isCompleted: subtask.isCompleted
					}))
				}))
			}))
		};
	});

/**
 * DOCU: Deletes a board owned by the current user. <br>
 * Triggered: On submission of delete board form. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export const deleteBoardAction = authActionClient
	.schema(delete_board_schema)
	.action(async ({ parsedInput, ctx }) => {
		await prisma.board.delete({
			where: {
				id: parsedInput.id,
				userId: ctx.userId
			}
		});
	});

/**
 * DOCU: Fetches a single board with all its columns, tasks, and subtasks. <br>
 * Triggered: When loading a specific board page. <br>
 * Last Updated: December 30, 2024
 * @author Jhones
 */
export async function getBoardById(board_id: string): Promise<Board | null> {
	const board = await prisma.board.findUnique({
		where: { id: board_id },
		include: {
			columns: {
				include: {
					tasks: {
						include: {
							subtasks: true
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
		columnOrder: board.columnOrder,
		columns: sortByIdOrder(board.columns, board.columnOrder).map((column) => ({
			id: column.id,
			name: column.name,
			taskOrder: column.taskOrder,
			tasks: sortByIdOrder(column.tasks, column.taskOrder).map((task) => ({
				id: task.id,
				title: task.title,
				description: task.description || "",
				subtaskOrder: task.subtaskOrder,
				subtasks: sortByIdOrder(task.subtasks, task.subtaskOrder).map((subtask) => ({
					id: subtask.id,
					title: subtask.title,
					isCompleted: subtask.isCompleted
				}))
			}))
		}))
	};
}
