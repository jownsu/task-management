"use server";

/* PLUGINS */
import bcrypt from "bcryptjs";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient, getAuthUser } from "@/lib/safe-action";

/* SCHEMA */
import { update_name_schema, change_password_schema } from "@/schema/profile-schema";

/* TYPES */
import type { UserProfile } from "@/types";

/**
 * DOCU: Fetches the current user's profile including stats (boards, columns, tasks, subtasks). <br>
 * Triggered: When loading the profile page. <br>
 * Last Updated: March 25, 2026
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

	const [total_boards, total_columns, total_tasks, total_subtasks, completed_subtasks] = await Promise.all([
		prisma.board.count({ where: { userId: user.id } }),
		prisma.column.count({ where: { board: { userId: user.id } } }),
		prisma.task.count({ where: { column: { board: { userId: user.id } } } }),
		prisma.subtask.count({ where: { task: { column: { board: { userId: user.id } } } } }),
		prisma.subtask.count({ where: { task: { column: { board: { userId: user.id } } }, isCompleted: true } }),
	]);

	const completion_rate = total_subtasks > 0 ? Math.round((completed_subtasks / total_subtasks) * 100) : 0;

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
