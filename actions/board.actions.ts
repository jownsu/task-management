"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient, getAuthUser } from "@/lib/safe-action";
import { sortByIdOrder } from "@/lib/helpers";

/* SCHEMA */
import { add_board_schema, delete_board_schema, reorder_board_schema } from "@/schema/board-schema";

/* TYPES */
import { Board } from "@/types";

/**
 * DOCU: Fetches all boards for the current user (including board type), sorted by their custom board order. <br>
 * Triggered: When loading the sidebar or boards list. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export async function getAllBoards(): Promise<Pick<Board, "id" | "name" | "type">[]> {
	const user = await getAuthUser();

	const [boards, user_data] = await Promise.all([
		prisma.board.findMany({
			where: { userId: user.id },
			select: { id: true, name: true, type: true },
			orderBy: { createdAt: "asc" }
		}),
		prisma.user.findUnique({
			where: { id: user.id },
			select: { boardOrder: true }
		})
	]);

	const board_order = user_data?.boardOrder || [];

	if (board_order.length === 0) {
		return boards;
	}

	/* Sort by boardOrder, append any boards not in the order at the end */
	const sorted = sortByIdOrder(boards, board_order);
	const sorted_ids = new Set(sorted.map((board) => board.id));
	const remaining = boards.filter((board) => !sorted_ids.has(board.id));

	return [...sorted, ...remaining];
}

/**
 * DOCU: Creates a new board for the current user. For TASK_MANAGEMENT boards, creates columns. For HABIT_TRACKER boards, creates habits. <br>
 * Triggered: On submission of new board form. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export const createBoardAction = authActionClient
	.schema(add_board_schema)
	.action(async ({ parsedInput, ctx }) => {
		const board = await prisma.$transaction(async (tx) => {
			/* Create the board with columns or habits depending on type */
			const new_board = await tx.board.create({
				data: {
					name: parsedInput.name,
					type: parsedInput.type,
					userId: ctx.userId,
					columns:
						parsedInput.type === "TASK_MANAGEMENT" && parsedInput.columns
							? { create: parsedInput.columns.map((column) => ({ name: column.name, theme: column.theme })) }
							: undefined,
					habits:
						parsedInput.type === "HABIT_TRACKER" && parsedInput.habits
							? { create: parsedInput.habits.map((habit) => ({ name: habit.name, theme: habit.theme, goal: habit.goal })) }
							: undefined
				},
				include: {
					columns: { select: { id: true }, orderBy: { createdAt: "asc" } },
					habits: { select: { id: true }, orderBy: { createdAt: "asc" } }
				}
			});

			/* Set column / habit order on the board */
			const updated_board = await tx.board.update({
				where: { id: new_board.id },
				data: {
					columnOrder: new_board.columns.map((column) => column.id),
					habitOrder: new_board.habits.map((habit) => habit.id)
				},
				select: {
					id: true,
					name: true,
					type: true,
					columnOrder: true,
					habitOrder: true
				}
			});

			/* Append the new board to the user's board order */
			await tx.user.update({
				where: { id: ctx.userId },
				data: { boardOrder: { push: updated_board.id } }
			});

			return updated_board;
		});

		return board;
	});

/**
 * DOCU: Deletes a board owned by the current user and removes it from board order. <br>
 * Triggered: On submission of delete board form. <br>
 * Last Updated: April 06, 2026
 * @author Jhones
 */
export const deleteBoardAction = authActionClient
	.schema(delete_board_schema)
	.action(async ({ parsedInput, ctx }) => {
		await prisma.$transaction(async (tx) => {
			await tx.board.delete({
				where: {
					id: parsedInput.id,
					userId: ctx.userId
				}
			});

			/* Remove the deleted board from the user's board order */
			const user = await tx.user.findUniqueOrThrow({
				where: { id: ctx.userId },
				select: { boardOrder: true }
			});

			await tx.user.update({
				where: { id: ctx.userId },
				data: { boardOrder: user.boardOrder.filter((id) => id !== parsedInput.id) }
			});
		});
	});

/**
 * DOCU: Updates the board order for the current user. <br>
 * Triggered: When a user finishes dragging a board in the sidebar list. <br>
 * Last Updated: April 02, 2026
 * @author Jhones
 */
export const reorderBoardAction = authActionClient
	.schema(reorder_board_schema)
	.action(async ({ parsedInput, ctx }) => {
		await prisma.user.update({
			where: { id: ctx.userId },
			data: { boardOrder: parsedInput.updated_board_order }
		});
	});
