/* NEXT */
import { useRouter } from "next/navigation";

/* ACTIONS */
import { createBoardAction, deleteBoardAction, editBoardAction, reorderBoardAction } from "@/actions/board.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { AddBoardSchema, DeleteBoardSchema, EditBoardSchema, ReorderBoardSchema } from "@/schema/board-schema";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARD, CACHE_KEY_BOARDS } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * DOCU: Will create a new board. <br>
 * Triggered: On submission of new board form. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export const useCreateBoard = (callback?: CallbackResponse<Board>) => {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { mutate: createBoard, ...rest } = useMutation({
		mutationFn: (payload: AddBoardSchema) => executeAction(createBoardAction(payload)),
		onSuccess: (response) => {
			if (response) {
				queryClient.setQueryData<Board[]>(CACHE_KEY_BOARDS, (boards) => {
					if (boards) {
						return [...boards, response];
					}
				});

				router.push(`/${response.id}`);
			}

			callback?.onSuccess?.(response);
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		}
	});

	return { createBoard, ...rest };
};

/**
 * DOCU: Will edit the selected board. <br>
 * Triggered: On submission of edit board form. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export const useEditBoard = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: editBoard, ...rest } = useMutation({
		mutationFn: (payload: EditBoardSchema) => executeAction(editBoardAction(payload)),
		onSuccess: (response) => {
			if(response){
				queryClient.setQueryData<Board[]>(CACHE_KEY_BOARDS, (boards) => {
					if(boards){
						return boards.map(board => {
							if(board.id === response.id){
								return response;
							}

							return board;
						})
					}
				});

				queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, response.id], (board) => {
					if(board){
						return response
					}
				});

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
 * DOCU: Will delete the selected board. <br>
 * Triggered: On submission of delete board form. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export const useDeleteBoard = (callback?: CallbackResponse) => {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { mutate: deleteBoard, ...rest } = useMutation({
		mutationFn: (payload: DeleteBoardSchema) => executeAction(deleteBoardAction(payload)),
		onSuccess: (_, payload) => {
			queryClient.setQueryData<Board[]>(CACHE_KEY_BOARDS, (boards) => {
				if (boards) {
					router.push(boards.length > 1 ? `/${boards[0].id}` : "/");

					return boards.filter((board) => board.id !== payload.id);
				}

				return boards;
			});

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

			const previous_boards = queryClient.getQueryData<Omit<Board, "columns" | "columnOrder">[]>(CACHE_KEY_BOARDS);

			queryClient.setQueryData<Omit<Board, "columns" | "columnOrder">[]>(CACHE_KEY_BOARDS, (boards) => {
				if (!boards) return boards;

				const board_map = new Map(boards.map((board) => [board.id, board]));
				return payload.updated_board_order.map((id) => board_map.get(id)).filter(Boolean) as Omit<Board, "columns" | "columnOrder">[];
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
