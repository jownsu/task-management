/**
 * DOCU: Extracts data from a safe action result or throws on server error. <br>
 * Triggered: Used as mutationFn wrapper to avoid repeating error handling boilerplate. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export async function executeAction<Data>(action: Promise<{ data?: Data; serverError?: string } | undefined>): Promise<Data | undefined> {
	const result = await action;

	if (result?.serverError) {
		throw new Error(result.serverError);
	}

	return result?.data;
}
