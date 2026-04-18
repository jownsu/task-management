/* NEXT */
import { useRouter } from "next/navigation";

/* ACTIONS */
import { createBoardAction, deleteBoardAction, reorderBoardAction } from "@/actions/board.actions";
import { editTaskManagementBoard } from "@/actions/task-management-board.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { AddBoardSchema, DeleteBoardSchema, EditBoardSchema, ReorderBoardSchema } from "@/schema/board-schema";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARDS, CACHE_KEY_TASK_MANAGEMENT_BOARD } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type BoardListItem = Pick<Board, "id" | "name" | "type">;

const BOARD_ROUTES: Record<Board["type"], string> = {
	TASK_MANAGEMENT: "/tasks",
	HABIT_TRACKER: "/habits"
};

/**
 * DOCU: Creates a new board (task-management or habit-tracker) and navigates to its detail page. <br>
 * Triggered: On submission of new board form. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export const useCreateBoard = (callback?: CallbackResponse<BoardListItem>) => {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { mutate: createBoard, ...rest } = useMutation({
		mutationFn: (payload: AddBoardSchema) => executeAction(createBoardAction(payload)),
		onSuccess: (response) => {
			if (response) {
				queryClient.setQueryData<BoardListItem[]>(CACHE_KEY_BOARDS, (boards) => {
					if (boards) {
						return [...boards, { id: response.id, name: response.name, type: response.type }];
					}
				});

				router.push(`${BOARD_ROUTES[response.type]}/${response.id}`);
			}

			toast.success("Board created successfully.");
			callback?.onSuccess?.(response ? { id: response.id, name: response.name, type: response.type } : undefined);
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		}
	});

	return { createBoard, ...rest };
};

/**
 * DOCU: Edits a task-management board and its columns + tags. <br>
 * Triggered: On submission of edit task-management board form. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export const useEditTaskManagementBoard = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: editBoard, ...rest } = useMutation({
		mutationFn: (payload: EditBoardSchema) => executeAction(editTaskManagementBoard(payload)),
		onSuccess: (response) => {
			if (response) {
				queryClient.setQueryData<BoardListItem[]>(CACHE_KEY_BOARDS, (boards) => {
					if (boards) {
						return boards.map((board) => {
							if (board.id === response.id) {
								return { id: response.id, name: response.name, type: response.type };
							}

							return board;
						});
					}
				});

				queryClient.setQueryData<Board>([...CACHE_KEY_TASK_MANAGEMENT_BOARD, response.id], (board) => {
					if (board) {
						return response;
					}
				});

				toast.success("Board updated successfully.");
				callback?.onSuccess?.();
			}
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		}
	});

	return { editBoard, ...rest };
};

/**
 * DOCU: Deletes the selected board and routes to the first remaining board (or home if none). <br>
 * Triggered: On submission of delete board form. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export const useDeleteBoard = (callback?: CallbackResponse) => {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { mutate: deleteBoard, ...rest } = useMutation({
		mutationFn: (payload: DeleteBoardSchema) => executeAction(deleteBoardAction(payload)),
		onSuccess: (_, payload) => {
			queryClient.setQueryData<BoardListItem[]>(CACHE_KEY_BOARDS, (boards) => {
				if (boards) {
					const remaining = boards.filter((board) => board.id !== payload.id);

					if (remaining.length > 0) {
						const next = remaining[0];
						router.push(`${BOARD_ROUTES[next.type]}/${next.id}`);
					} else {
						router.push("/");
					}

					return remaining;
				}

				return boards;
			});

			toast.success("Board deleted successfully.");
			callback?.onSuccess?.();
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		}
	});

	return { deleteBoard, ...rest };
};

/**
 * DOCU: Will reorder boards in the sidebar with optimistic cache update. <br>
 * Triggered: When a user finishes dragging a board in the sidebar list. <br>
 * Last Updated: April 02, 2026
 * @author Jhones
 */
export const useReorderBoard = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: reorderBoard, ...rest } = useMutation({
		mutationFn: (payload: ReorderBoardSchema) => executeAction(reorderBoardAction(payload)),
		onMutate: async (payload) => {
			await queryClient.cancelQueries({ queryKey: CACHE_KEY_BOARDS });

			const previous_boards = queryClient.getQueryData<BoardListItem[]>(CACHE_KEY_BOARDS);

			queryClient.setQueryData<BoardListItem[]>(CACHE_KEY_BOARDS, (boards) => {
				if (!boards) return boards;

				const board_map = new Map(boards.map((board) => [board.id, board]));
				return payload.updated_board_order.map((id) => board_map.get(id)).filter(Boolean) as BoardListItem[];
			});

			return { previous_boards };
		},
		onError: (_, __, context) => {
			if (context?.previous_boards) {
				queryClient.setQueryData(CACHE_KEY_BOARDS, context.previous_boards);
			}

			toast.error("Something went wrong. Please try again.");
			callback?.onError?.();
		},
		onSuccess: () => {
			callback?.onSuccess?.();
		}
	});

	return { reorderBoard, ...rest };
};
