/* ACTIONS */
import { createTaskAction } from "@/actions/task.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { CreateTaskSchemaType } from "@/schema/task-schema";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARD } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DOCU: Will create a new task with its subtasks. <br>
 * Triggered: On submission of new task form. <br>
 * Last Updated: March 07, 2026
 * @author Jhones
 */
export const useCreateTask = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: createTask, ...rest } = useMutation({
		mutationFn: (payload: CreateTaskSchemaType) => executeAction(createTaskAction(payload)),
		onSuccess: (response, payload) => {
			if (response) {
				queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
					if (!board) return board;

					return {
						...board,
						columns: board.columns?.map((column) =>
							column.id === payload.column_id
								? { ...column, tasks: [...(column.tasks || []), response] }
								: column
						)
					};
				});
			}

			callback?.onSuccess?.();
		}
	});

	return { createTask, ...rest };
};
