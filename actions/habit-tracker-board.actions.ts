"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { sortByIdOrder } from "@/lib/helpers";

/* TYPES */
import { Board } from "@/types";

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
