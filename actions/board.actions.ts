"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient, getAuthUser } from "@/lib/safe-action";

/* SCHEMA */
import { add_board_schema, delete_board_schema } from "@/schema/board-schema";

/* TYPES */
import { Board } from "@/types";

/**
 * DOCU: Fetches all boards for the current user from the database. <br>
 * Triggered: When loading the sidebar or boards list. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export async function getAllBoards(): Promise<Omit<Board, "columns">[]> {
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
		const board = await prisma.board.create({
			data: {
				name: parsedInput.name,
				userId: ctx.userId,
				columns: {
					create: parsedInput.columns.map((column, index) => ({
						name: column.name,
						order: index
					}))
				}
			},
			select: {
				id: true,
				name: true
			}
		});

		return board;
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
				orderBy: { order: "asc" },
				include: {
					tasks: {
						orderBy: { order: "asc" },
						include: {
							subtasks: {
								orderBy: { order: "asc" }
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
		columns: board.columns.map((column) => ({
			id: column.id,
			name: column.name,
			order: column.order,
			tasks: column.tasks.map((task) => ({
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
			}))
		}))
	};
}
