/* ACTIONS */
import { createBoardAction } from "@/actions/board.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* SCHEMA */
import { AddBoardSchema } from "@/schema/board-schema";

/* CONSTANTS */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DOCU: Will create a new board. <br>
 * Triggered: On submission of new board form. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export const useCreateBoard = (callback?: CallbackResponse<Board>) => {

	const queryClient = useQueryClient();

	const { mutate: createBoard, ...rest } = useMutation({
		mutationFn: (payload: AddBoardSchema) => executeAction(createBoardAction(payload)),
		onSuccess: (response) => {
			queryClient.setQueryData<Board[]>(CACHE_KEY_BOARDS, (boards) => {
				if (boards && response) {
					return [...boards, response];
				}
			});

			callback?.onSuccess?.(response);
		}
	});

	return { createBoard, ...rest };
};
