"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";

/* SCHEMA */
import { toggle_habit_log_schema } from "@/schema/board-schema";

/* TYPES */
import type { HabitLog } from "@/types";

/**
 * DOCU: Fetches all habit logs for a board within a given year/month. Date strings are returned as `YYYY-MM-DD`. <br>
 * Triggered: When the habit-tracker board renders or the visible month changes. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export async function getHabitLogsForBoard(board_id: string, year: number, month_num: number): Promise<HabitLog[]> {
	const start_date = new Date(Date.UTC(year, month_num - 1, 1));
	const end_date = new Date(Date.UTC(year, month_num, 1));

	const logs = await prisma.habitLog.findMany({
		where: {
			habit: { boardId: board_id },
			date: { gte: start_date, lt: end_date }
		},
		select: { habitId: true, date: true }
	});

	return logs.map((log) => ({
		habitId: log.habitId,
		date: log.date.toISOString().slice(0, 10)
	}));
}

/**
 * DOCU: Toggles a habit log for a given habit and date. Creates if missing, deletes if present. <br>
 * Triggered: When the user clicks a day cell in the habit grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const toggleHabitLogAction = authActionClient
	.schema(toggle_habit_log_schema)
	.action(async ({ parsedInput }) => {
		const { habit_id, date } = parsedInput;
		const date_obj = new Date(`${date}T00:00:00.000Z`);

		const existing = await prisma.habitLog.findUnique({
			where: { habitId_date: { habitId: habit_id, date: date_obj } }
		});

		if (existing) {
			await prisma.habitLog.delete({
				where: { habitId_date: { habitId: habit_id, date: date_obj } }
			});
			return { habitId: habit_id, date, completed: false };
		}

		await prisma.habitLog.create({
			data: { habitId: habit_id, date: date_obj }
		});
		return { habitId: habit_id, date, completed: true };
	});
