"use server";

/* PLUGINS */
import bcrypt from "bcryptjs";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient, getAuthUser } from "@/lib/safe-action";

/* SCHEMA */
import { update_name_schema, change_password_schema, delete_account_schema } from "@/schema/profile-schema";

/* TYPES */
import type { UserProfile } from "@/types";

/**
 * DOCU: Computes current and longest habit streaks from a sorted ascending array of unique YYYY-MM-DD date strings. <br>
 * Current streak walks backward from the end of the sorted array and breaks on the first gap — no Set needed. <br>
 * Triggered: Inside getUserProfile. <br>
 * Last Updated: May 23, 2026
 * @author Jhones
 */
function computeHabitStreaks(unique_dates_asc: string[]): { current_streak: number; longest_streak: number } {
	if (unique_dates_asc.length === 0) return { current_streak: 0, longest_streak: 0 };

	/* Longest streak — must scan all dates */
	let longest_streak = 1;
	let temp = 1;
	for (let i = 1; i < unique_dates_asc.length; i++) {
		const diff = Math.round(
			(new Date(unique_dates_asc[i] + "T00:00:00.000Z").getTime() - new Date(unique_dates_asc[i - 1] + "T00:00:00.000Z").getTime()) / 86400000
		);
		if (diff === 1) { temp++; if (temp > longest_streak) longest_streak = temp; }
		else temp = 1;
	}

	/* Current streak — walk backward from the last date, break on first gap */
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);
	const today_str = today.toISOString().slice(0, 10);
	const yesterday_str = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);

	const last_date = unique_dates_asc[unique_dates_asc.length - 1];
	if (last_date !== today_str && last_date !== yesterday_str) return { current_streak: 0, longest_streak };

	let current_streak = 0;
	let idx = unique_dates_asc.length - 1;
	const anchor = new Date(last_date + "T00:00:00.000Z");

	while (idx >= 0) {
		const expected = new Date(anchor.getTime() - current_streak * 86400000).toISOString().slice(0, 10);
		if (unique_dates_asc[idx] === expected) { current_streak++; idx--; }
		else break;
	}

	return { current_streak, longest_streak };
}

/**
 * DOCU: Fetches the current user's profile including stats (boards, columns, tasks, subtasks) and habit stats. <br>
 * Triggered: When loading the profile page. <br>
 * Last Updated: May 23, 2026
 * @author Jhones
 */
export async function getUserProfile(): Promise<UserProfile> {
	const user = await getAuthUser();

	const db_user = await prisma.user.findUnique({
		where: { id: user.id },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			password: true,
			createdAt: true,
			accounts: {
				select: { provider: true },
				take: 1,
			},
		},
	});

	if (!db_user) {
		throw new Error("User not found");
	}

	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);
	const today_str = today.toISOString().slice(0, 10);

	const seven_days_ago = new Date(today);
	seven_days_ago.setUTCDate(seven_days_ago.getUTCDate() - 6);

	const [total_boards, total_columns, total_tasks, total_subtasks, completed_subtasks, total_habits, all_log_dates, weekly_log_counts] = await Promise.all([
		prisma.board.count({ where: { userId: user.id } }),
		prisma.column.count({ where: { board: { userId: user.id } } }),
		prisma.task.count({ where: { column: { board: { userId: user.id } } } }),
		prisma.subtask.count({ where: { task: { column: { board: { userId: user.id } } } } }),
		prisma.subtask.count({ where: { task: { column: { board: { userId: user.id } } }, isCompleted: true } }),
		prisma.habit.count({ where: { board: { userId: user.id } } }),
		/* All unique log dates (ascending) — used for streak computation */
		prisma.habitLog.groupBy({
			by: ["date"],
			where: { habit: { board: { userId: user.id } } },
			orderBy: { date: "asc" },
		}),
		/* Per-day log counts for last 7 days — at most 7 rows returned */
		prisma.habitLog.groupBy({
			by: ["date"],
			_count: { id: true },
			where: {
				habit: { board: { userId: user.id } },
				date: { gte: seven_days_ago },
			},
			orderBy: { date: "asc" },
		}),
	]);

	const completion_rate = total_subtasks > 0 ? Math.round((completed_subtasks / total_subtasks) * 100) : 0;

	const unique_dates_asc = all_log_dates.map((g) => g.date.toISOString().slice(0, 10));
	const { current_streak, longest_streak } = computeHabitStreaks(unique_dates_asc);

	/* Map for O(1) lookup — at most 7 entries */
	const weekly_count_map = new Map(weekly_log_counts.map(({ date, _count }) => [date.toISOString().slice(0, 10), _count.id]));

	const weekly_activity = Array.from({ length: 7 }, (_, i) => {
		const d = new Date(today);
		d.setUTCDate(d.getUTCDate() - (6 - i));
		const date_str = d.toISOString().slice(0, 10);
		return { date: date_str, count: weekly_count_map.get(date_str) ?? 0 };
	});

	const today_completed = weekly_count_map.get(today_str) ?? 0;

	return {
		id: db_user.id,
		name: db_user.name,
		email: db_user.email,
		image: db_user.image,
		createdAt: db_user.createdAt,
		has_password: !!db_user.password,
		provider: db_user.accounts[0]?.provider ?? null,
		stats: {
			total_boards,
			total_columns,
			total_tasks,
			total_subtasks,
			completed_subtasks,
			completion_rate,
		},
		habit_stats: {
			total_habits,
			current_streak,
			longest_streak,
			today_completed,
			weekly_activity,
		},
	};
}

/**
 * DOCU: Updates the current user's display name. <br>
 * Triggered: When the user submits the edit profile form. <br>
 * Last Updated: March 25, 2026
 * @author Jhones
 */
export const updateUserName = authActionClient
	.schema(update_name_schema)
	.action(async ({ parsedInput, ctx }) => {
		const updated_user = await prisma.user.update({
			where: { id: ctx.userId },
			data: { name: parsedInput.name },
			select: { id: true, name: true },
		});

		return updated_user;
	});

/**
 * DOCU: Changes the current user's password after verifying the current one. <br>
 * Triggered: When the user submits the change password form. <br>
 * Last Updated: March 25, 2026
 * @author Jhones
 */
export const changePassword = authActionClient
	.schema(change_password_schema)
	.action(async ({ parsedInput, ctx }) => {
		const user = await prisma.user.findUnique({
			where: { id: ctx.userId },
			select: { password: true },
		});

		if (!user?.password) {
			throw new Error("Password change is not available for OAuth accounts");
		}

		const is_valid = await bcrypt.compare(parsedInput.current_password, user.password);

		if (!is_valid) {
			throw new Error("Current password is incorrect");
		}

		const hashed_password = await bcrypt.hash(parsedInput.new_password, 10);

		await prisma.user.update({
			where: { id: ctx.userId },
			data: { password: hashed_password },
		});

		return { success: true };
	});

/**
 * DOCU: Permanently deletes the current user's account and all associated data. <br>
 * Triggered: When the user confirms account deletion on the profile page. <br>
 * Last Updated: April 04, 2026
 * @author Jhones
 */
export const deleteAccount = authActionClient
	.schema(delete_account_schema)
	.action(async ({ ctx }) => {
		await prisma.user.delete({
			where: { id: ctx.userId },
		});

		return { success: true };
	});
