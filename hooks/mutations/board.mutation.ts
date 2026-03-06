/* NEXT */
import { useRouter } from "next/navigation";

/* ACTIONS */
import { createBoardAction, deleteBoardAction } from "@/actions/board.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { AddBoardSchema, DeleteBoardSchema, EditBoardSchema } from "@/schema/board-schema";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARD, CACHE_KEY_BOARDS } from "@/constants/query-keys";

/* SERVICES */
import boardService from "@/services/board.service";

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

/**
 * DOCU: Will edit the selected board. <br>
 * Triggered: On submission of edit board form. <br>
 * Last Updated: March 06, 2026
 * @author Jhones
 */
export const useEditBoard = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: editBoard, ...rest } = useMutation({
		mutationFn: async (payload: EditBoardSchema) => boardService.editBoard(payload),
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
	});

	return { deleteBoard, ...rest };
};
