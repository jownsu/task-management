/* SCHEMA */
import { EditBoardSchema } from "@/schema/board-schema";

/* SERVICES */
import boardService from "@/services/board.service";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARD, CACHE_KEY_BOARDS } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DOCU: Will edit the selected board. <br>
 * Triggered: On submission of edit board form. <br>
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
