"use server";

import prisma from "@/lib/prisma";
import { Board } from "@/types";

/**
 * DOCU: Fetches all boards for the current user from the database. <br>
 * Triggered: When loading the sidebar or boards list. <br>
 * Last Updated: December 30, 2024
 * @author Jhones
 */
export async function getAllBoards(): Promise<Omit<Board, "columns">[]> {
	const boards = await prisma.board.findMany({
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
