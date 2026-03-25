/* ACTIONS */
import { updateUserName, changePassword } from "@/actions/user.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import type { UpdateNameSchema, ChangePasswordSchema } from "@/schema/profile-schema";

/* TYPES */
import { CallbackResponse } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_USER } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DOCU: Will update the current user's display name. <br>
 * Triggered: On submission of the edit profile form. <br>
 * Last Updated: March 25, 2026
 * @author Jhones
 */
export const useUpdateUserName = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: updateName, ...rest } = useMutation({
		mutationFn: (payload: UpdateNameSchema) => executeAction(updateUserName(payload)),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CACHE_KEY_USER });
			callback?.onSuccess?.();
		},
		onError: (error) => {
			callback?.onError?.(error.message);
		},
	});

	return { updateName, ...rest };
};

/**
 * DOCU: Will change the current user's password. <br>
 * Triggered: On submission of the change password form. <br>
 * Last Updated: March 25, 2026
 * @author Jhones
 */
export const useChangePassword = (callback?: CallbackResponse) => {
	const { mutate: changeUserPassword, ...rest } = useMutation({
		mutationFn: (payload: ChangePasswordSchema) => executeAction(changePassword(payload)),
		onSuccess: () => {
			callback?.onSuccess?.();
		},
		onError: (error) => {
			callback?.onError?.(error.message);
		},
	});

	return { changeUserPassword, ...rest };
};
