/* PLUGINS */
import { createSafeActionClient } from "next-safe-action";
import { auth } from "@/lib/auth";

/**
 * DOCU: Base safe action client with error handling configuration. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export const actionClient = createSafeActionClient({
	handleServerError(error) {
		if (error instanceof Error) {
			return error.message;
		}

		return "An unexpected error occurred";
	},
});

/**
 * DOCU: Authenticated safe action client that injects userId into context. <br>
 * Triggered: Used as the base for all server actions that require authentication. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export const authActionClient = actionClient.use(async ({ next }) => {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	return next({ ctx: { userId: session.user.id } });
});

/**
 * DOCU: Returns the authenticated user or throws an error. <br>
 * Triggered: When a server query function needs the current user. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export async function getAuthUser() {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	return session.user;
}
