/* ACTIONS */
import { addSubtaskAction, createTaskAction, deleteTaskAction, editTaskAction, reorderSubtaskAction, reorderTaskAction, updateSubtaskAction, updateTaskColumnAction } from "@/actions/task.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { AddSubtaskSchemaType, CreateTaskSchemaType, DeleteTaskSchemaType, EditTaskSchemaType, ReorderSubtaskSchemaType, ReorderTaskSchemaType, UpdateSubtaskSchemaType, UpdateTaskColumnSchemaType } from "@/schema/task-schema";

/* TYPES */
import { Board, CallbackResponse, Subtask, Task } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARD } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

			toast.success("Task created successfully.");
			callback?.onSuccess?.();
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
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

			toast.success("Task updated successfully.");
			callback?.onSuccess?.();
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
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

			toast.success("Task deleted successfully.");
			callback?.onSuccess?.();
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
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

			toast.error("Something went wrong. Please try again.");
		},
		onSuccess: () => {
			toast.success("Subtask updated successfully.");
			callback?.onSuccess?.();
		}
	});

	return { updateSubtask, ...rest };
};

/**
 * DOCU: Will move a task from one column to another. <br>
 * Triggered: On changing the column dropdown in view task modal. <br>
 * Last Updated: March 09, 2026
 * @author Jhones
 */
export const useUpdateTaskColumn = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: updateTaskColumn, ...rest } = useMutation({
		mutationFn: (payload: UpdateTaskColumnSchemaType) => executeAction(updateTaskColumnAction(payload)),
		onMutate: async (payload) => {
			await queryClient.cancelQueries({ queryKey: [...CACHE_KEY_BOARD, payload.board_id] });

			const previous_board = queryClient.getQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id]);

			queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
				if (!board) return board;

				/* Find the task being moved */
				const source_column = board.columns?.find((col) => col.id === payload.old_column_id);
				const task = source_column?.tasks?.find((t) => t.id === payload.task_id);

				if (!task) return board;

				return {
					...board,
					columns: board.columns?.map((column) => {
						if (column.id === payload.old_column_id) {
							return {
								...column,
								taskOrder: column.taskOrder.filter((id) => id !== payload.task_id),
								tasks: column.tasks?.filter((t) => t.id !== payload.task_id)
							};
						}
						if (column.id === payload.new_column_id) {
							return {
								...column,
								taskOrder: [...column.taskOrder, payload.task_id],
								tasks: [...(column.tasks || []), task]
							};
						}
						return column;
					})
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
			callback?.onSuccess?.();
		}
	});

	return { updateTaskColumn, ...rest };
};

/**
 * DOCU: Will reorder tasks within a column or move a task across columns via drag and drop. <br>
 * Triggered: When a task is dropped after dragging in the board view. <br>
 * Last Updated: March 20, 2026
 * @author Jhones
 */
export const useReorderTask = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: reorderTask, ...rest } = useMutation({
		mutationFn: (payload: ReorderTaskSchemaType) => executeAction(reorderTaskAction(payload)),
		onMutate: async (payload) => {
			await queryClient.cancelQueries({ queryKey: [...CACHE_KEY_BOARD, payload.board_id] });

			const previous_board = queryClient.getQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id]);

			queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
				if (!board) return board;

				/* Find which column currently holds the task in the cache */
				const source_column = board.columns?.find((col) => col.tasks?.some((t) => t.id === payload.task_id));
				const task = source_column?.tasks?.find((t) => t.id === payload.task_id);

				if (!source_column || !task) return board;

				const is_same_column = source_column.id === payload.updated_column_id;

				return {
					...board,
					columns: board.columns?.map((column) => {
						/* Same-column reorder: reorder tasks to match updated_task_order */
						if (is_same_column && column.id === payload.updated_column_id) {
							const task_map = new Map(column.tasks?.map((t) => [t.id, t]));
							const reordered_tasks = payload.updated_task_order.map((id) => task_map.get(id)).filter(Boolean) as Task[];

							return { ...column, taskOrder: payload.updated_task_order, tasks: reordered_tasks };
						}

						/* Cross-column: remove task from source column */
						if (!is_same_column && column.id === source_column.id) {
							return {
								...column,
								taskOrder: column.taskOrder.filter((id) => id !== payload.task_id),
								tasks: column.tasks?.filter((t) => t.id !== payload.task_id)
							};
						}

						/* Cross-column: add task to destination column in correct position */
						if (!is_same_column && column.id === payload.updated_column_id) {
							const all_tasks = [...(column.tasks || []), task];
							const task_map = new Map(all_tasks.map((t) => [t.id, t]));
							const reordered_tasks = payload.updated_task_order.map((id) => task_map.get(id)).filter(Boolean) as Task[];

							return { ...column, taskOrder: payload.updated_task_order, tasks: reordered_tasks };
						}

						return column;
					})
				};
			});

			return { previous_board };
		},
		onError: (_, payload, context) => {
			if (context?.previous_board) {
				queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], context.previous_board);
			}

			toast.error("Something went wrong. Please try again.");
			callback?.onError?.();
		},
		onSuccess: () => {
			callback?.onSuccess?.();
		}
	});

	return { reorderTask, ...rest };
};

/**
 * DOCU: Will reorder subtasks within a task via drag and drop. <br>
 * Triggered: When a subtask is dropped after dragging in the view task modal. <br>
 * Last Updated: April 05, 2026
 * @author Jhones
 */
export const useReorderSubtask = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: reorderSubtask, ...rest } = useMutation({
		mutationFn: (payload: ReorderSubtaskSchemaType) => executeAction(reorderSubtaskAction(payload)),
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
							? column.tasks?.map((task) => {
								if (task.id !== payload.task_id) return task;

								const subtask_map = new Map(task.subtasks.map((s) => [s.id, s]));
								const reordered_subtasks = payload.updated_subtask_order.map((id) => subtask_map.get(id)).filter(Boolean) as Subtask[];

								return { ...task, subtaskOrder: payload.updated_subtask_order, subtasks: reordered_subtasks };
							})
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
			callback?.onError?.();
		},
		onSuccess: () => {
			callback?.onSuccess?.();
		}
	});

	return { reorderSubtask, ...rest };
};

/**
 * DOCU: Will add a single subtask to an existing task. <br>
 * Triggered: On submission of quick-add subtask input in view task modal. <br>
 * Last Updated: April 07, 2026
 * @author Jhones
 */
export const useAddSubtask = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: addSubtask, ...rest } = useMutation({
		mutationFn: (payload: AddSubtaskSchemaType) => executeAction(addSubtaskAction(payload)),
		onSuccess: (response, payload) => {
			if (response) {
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
											subtaskOrder: [...task.subtaskOrder, response.id],
											subtasks: [...task.subtasks, response]
										}
										: task
								)
								: column.tasks
						}))
					};
				});
			}

			toast.success("Subtask added successfully.");
			callback?.onSuccess?.();
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		}
	});

	return { addSubtask, ...rest };
};
