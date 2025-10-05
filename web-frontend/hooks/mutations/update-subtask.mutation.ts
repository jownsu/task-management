/* SERVICES */
import taskService from "@/services/task.service";

/* TYPES */
import { Board, CallbackResponse, UpdateSubTaskPayload } from "@/types";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* CONSTANTS */
import { CACHE_KEY_BOARD } from "@/constants/query-keys";

/**
 * DOCU: Will update the status of subtask. <br>
 * Triggered: On submission of update subtask form. <br>
 */
export const useUpdateSubtask = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: updateSubtask, ...rest } = useMutation({
		mutationFn: async (payload: UpdateSubTaskPayload) => taskService.updateSubtask(payload),
		onSuccess: (response, payload) => {
			if (!response) return;

			queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
				if (!board) return board;

				return {
					...board,
					columns: board.columns?.map((column) => ({
						...column,
						tasks: column.id === payload.column_id
							? column.tasks?.map((task) =>
								task.id === payload.task_id &&
									task.subtasks
										? {
											...task,
											subtasks: task.subtasks.map(
												(subtask) =>
													subtask.id === payload.subtask_id
														? {
															...subtask,
															is_completed: payload.is_completed,
														}
														: subtask,
											),
										}
										: task,
							)
							: column.tasks,
					})),
				};
			});

			callback?.onSuccess?.();
		},
	});

	return { updateSubtask, ...rest };
};
