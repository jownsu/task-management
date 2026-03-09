/* ACTIONS */
import { createTaskAction, deleteTaskAction, editTaskAction, updateSubtaskAction } from "@/actions/task.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { CreateTaskSchemaType, DeleteTaskSchemaType, EditTaskSchemaType, UpdateSubtaskSchemaType } from "@/schema/task-schema";

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
								? {
									...column,
									taskOrder: [...column.taskOrder, response.id],
									tasks: [...(column.tasks || []), response]
								}
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

/**
 * DOCU: Will edit an existing task and its subtasks. <br>
 * Triggered: On submission of edit task form. <br>
 * Last Updated: March 07, 2026
 * @author Jhones
 */
export const useEditTask = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: editTask, ...rest } = useMutation({
		mutationFn: (payload: EditTaskSchemaType) => executeAction(editTaskAction(payload)),
		onSuccess: (response, payload) => {
			if (response) {
				queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
					if (!board) return board;

					return {
						...board,
						columns: board.columns?.map((column) => ({
							...column,
							tasks: column.tasks?.map((task) =>
								task.id === payload.id
									? {
										id: response.id,
										title: response.title,
										description: response.description,
										subtaskOrder: response.subtaskOrder,
										subtasks: response.subtasks
									}
									: task
							)
						}))
					};
				});
			}

			callback?.onSuccess?.();
		}
	});

	return { editTask, ...rest };
};

/**
 * DOCU: Will delete the selected task and its subtasks. <br>
 * Triggered: On submission of delete task form. <br>
 * Last Updated: March 07, 2026
 * @author Jhones
 */
export const useDeleteTask = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: deleteTask, ...rest } = useMutation({
		mutationFn: (payload: DeleteTaskSchemaType & { board_id: string; column_id: string }) => executeAction(deleteTaskAction({ id: payload.id })),
		onSuccess: (_, payload) => {
			queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
				if (!board) return board;

				return {
					...board,
					columns: board.columns?.map((column) =>
						column.id === payload.column_id
							? {
								...column,
								taskOrder: column.taskOrder.filter((task_id) => task_id !== payload.id),
								tasks: column.tasks?.filter((task) => task.id !== payload.id)
							}
							: column
					)
				};
			});

			callback?.onSuccess?.();
		}
	});

	return { deleteTask, ...rest };
};

/**
 * DOCU: Will update the completion status of a subtask. <br>
 * Triggered: On toggling a subtask checkbox in view task modal. <br>
 * Last Updated: March 09, 2026
 * @author Jhones
 */
export const useUpdateSubtask = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: updateSubtask, ...rest } = useMutation({
		mutationFn: (payload: UpdateSubtaskSchemaType) => executeAction(updateSubtaskAction(payload)),
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
										subtasks: task.subtasks.map((subtask) =>
											subtask.id === payload.subtask_id
												? { ...subtask, isCompleted: payload.isCompleted }
												: subtask
										)
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
		},
		onSuccess: () => {
			callback?.onSuccess?.();
		}
	});

	return { updateSubtask, ...rest };
};
