"use server";

/* SERVER */
import { db } from "@/server";
import { boards } from "@/server/schema";
import { auth } from "@/server/auth";

/* PLUGINS */
import { createSafeActionClient } from "next-safe-action";

/* SCHEMA */
import { eq } from "drizzle-orm";

const action = createSafeActionClient();

export const getBoardAction = action.action(async () => {
	const session = await auth();
	const user_id = session?.user.id;

	if (!user_id) {
		return {
			status: false,
			message: "Not authorized"
		};
	}

	const all_boards = await db.query.boards.findMany({
		where: eq(boards.user_id, user_id),
		with: {
			columns: {
				columns: {
					id: true,
					title: true
				}
			}
		}
	});

	return {
		status: true,
		data: all_boards
	};
});
