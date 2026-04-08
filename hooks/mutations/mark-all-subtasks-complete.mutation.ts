/* ACTIONS */
import { markAllSubtasksCompleteAction } from "@/actions/task.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { MarkAllSubtasksCompleteSchemaType } from "@/schema/task-schema";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARD } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * DOCU: Will mark all subtasks of a task as completed with optimistic updates. <br>
 * Triggered: On clicking the "Mark all as done" button in the view task modal. <br>
 * Last Updated: April 08, 2026
 * @author Jhones
 */
export const useMarkAllSubtasksComplete = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: markAllSubtasksComplete, ...rest } = useMutation({
		mutationFn: (payload: MarkAllSubtasksCompleteSchemaType) => executeAction(markAllSubtasksCompleteAction(payload)),
		onMutate: async (payload) => {
			await queryClient.cancelQueries({ queryKey: [...CACHE_KEY_BOARD, payload.board_id] });

			const previous_board = queryClient.getQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id]);

			queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
				if (!board) return board;

				return {
					...board,
					columns: board.columns?.map((column) => ({
						...column,
						tasks: column.id === payload.column_id
							? column.tasks?.map((task) =>
								task.id === payload.task_id
									? {
										...task,
										subtasks: task.subtasks.map((subtask) => ({ ...subtask, isCompleted: true }))
									}
									: task
							)
							: column.tasks
					}))
				};
			});

			return { previous_board };
		},
		onError: (_, payload, context) => {
			if (context?.previous_board) {
				queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], context.previous_board);
			}

			toast.error("Something went wrong. Please try again.");
		},
		onSuccess: () => {
			toast.success("All subtasks marked as done.");
			callback?.onSuccess?.();
		}
	});

	return { markAllSubtasksComplete, ...rest };
};
