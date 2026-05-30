"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";
import { sortByIdOrder } from "@/lib/helpers";

/* SCHEMA */
import { add_habit_schema, edit_habit_board_schema, edit_habit_schema, reorder_habit_schema } from "@/schema/board-schema";

/* TYPES */
import { Board } from "@/types";

/**
 * DOCU: Edits a habit-tracker board and its habits for the current user. <br>
 * Triggered: On submission of edit board form for a HABIT_TRACKER board. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const editHabitTrackerBoard = authActionClient
	.schema(edit_habit_board_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { id, name, habits } = parsedInput;

		/* Get existing habit IDs to determine which ones to delete */
		const existing_habits = await prisma.habit.findMany({
			where: { boardId: id },
			select: { id: true }
		});

		const existing_habit_ids = existing_habits.map((habit) => habit.id);
		const payload_habit_ids = habits.filter((habit) => habit.id && !habit.is_new).map((habit) => habit.id!);
		const habits_to_delete = existing_habit_ids.filter((habit_id) => !payload_habit_ids.includes(habit_id));

		const board = await prisma.$transaction(async (tx) => {
			/* Delete removed habits */
			if (habits_to_delete.length > 0) {
				await tx.habit.deleteMany({
					where: { id: { in: habits_to_delete } }
				});
			}

			/* Update existing habits and create new ones, collect IDs for ordering */
			const habit_ids: string[] = [];

			for (const habit of habits) {
				if (habit.id && !habit.is_new) {
					await tx.habit.update({
						where: { id: habit.id },
						data: { name: habit.name, theme: habit.theme, goal: habit.goal }
					});
					habit_ids.push(habit.id);
				} else {
					const new_habit = await tx.habit.create({
						data: { name: habit.name, theme: habit.theme, goal: habit.goal, boardId: id }
					});
					habit_ids.push(new_habit.id);
				}
			}

			/* Update board name and habit order, return full board with habits */
			return tx.board.update({
				where: { id, userId: ctx.userId },
				data: { name, habitOrder: habit_ids },
				include: {
					habits: true
				}
			});
		});

		return {
			id: board.id,
			name: board.name,
			type: board.type,
			columnOrder: board.columnOrder,
			habitOrder: board.habitOrder,
			habits: sortByIdOrder(board.habits, board.habitOrder).map((habit) => ({
				id: habit.id,
				name: habit.name,
				theme: habit.theme,
				goal: habit.goal
			}))
		};
	});

/**
 * DOCU: Fetches a single habit-tracker board with its habits. <br>
 * Triggered: When loading a habit-tracker board detail page. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export async function getHabitTrackerBoardById(board_id: string): Promise<Board | null> {
	const board = await prisma.board.findUnique({
		where: { id: board_id, type: "HABIT_TRACKER" },
		include: {
			habits: true
		}
	});

	if (!board) return null;

	return {
		id: board.id,
		name: board.name,
		type: board.type,
		columnOrder: board.columnOrder,
		habitOrder: board.habitOrder,
		habits: sortByIdOrder(board.habits, board.habitOrder).map((habit) => ({
			id: habit.id,
			name: habit.name,
			theme: habit.theme,
			goal: habit.goal
		}))
	};
}

/**
 * DOCU: Creates a new habit on a habit-tracker board and appends it to habitOrder. <br>
 * Triggered: On submission of the Add Habit modal. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const addHabitAction = authActionClient
	.schema(add_habit_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { board_id, name, theme, goal } = parsedInput;

		const habit = await prisma.$transaction(async (tx) => {
			const new_habit = await tx.habit.create({
				data: { name, theme, goal, boardId: board_id }
			});

			await tx.board.update({
				where: { id: board_id, userId: ctx.userId },
				data: { habitOrder: { push: new_habit.id } }
			});

			return new_habit;
		});

		return {
			id: habit.id,
			name: habit.name,
			theme: habit.theme,
			goal: habit.goal,
			board_id
		};
	});

/**
 * DOCU: Persists a new habit order on a habit-tracker board by overwriting its habitOrder. Verifies board ownership before mutating. <br>
 * Triggered: When the user finishes dragging a habit card into a new position. <br>
 * Last Updated: May 30, 2026
 * @author Jhones
 */
export const reorderHabitAction = authActionClient
	.schema(reorder_habit_schema)
	.action(async ({ parsedInput, ctx }) => {
		await prisma.board.update({
			where: { id: parsedInput.board_id, userId: ctx.userId },
			data: { habitOrder: parsedInput.updated_habit_order }
		});
	});

/**
 * DOCU: Updates a single habit's name, theme, and goal. Verifies board ownership before mutating. <br>
 * Triggered: On submission of the Edit Habit modal. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const editHabitAction = authActionClient
	.schema(edit_habit_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { id, board_id, name, theme, goal } = parsedInput;

		const board = await prisma.board.findUnique({
			where: { id: board_id, userId: ctx.userId },
			select: { id: true }
		});

		if (!board) throw new Error("Board not found");

		const habit = await prisma.habit.update({
			where: { id, boardId: board_id },
			data: { name, theme, goal }
		});

		return {
			id: habit.id,
			name: habit.name,
			theme: habit.theme,
			goal: habit.goal,
			board_id
		};
	});
