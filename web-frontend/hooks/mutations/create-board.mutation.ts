/* SCHEMA */
import { AddBoardSchema } from "@/schema/board-schema";

/* SERVICES */
import boardService from "@/services/board.service";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DOCU: Will create a new board. <br>
 * Triggered: On submission of new board form. <br>
 */
export const useCreateBoard = (callback?: CallbackResponse) => {

	const queryClient = useQueryClient();

	const { mutate: createBoard, ...rest } = useMutation({
		mutationFn: async (payload: AddBoardSchema) => boardService.createBoard(payload),
		onSuccess: (response) => {
			if(response){
				queryClient.setQueryData<Board[]>(CACHE_KEY_BOARDS, (boards) => {
					if(boards){
						return [...boards, response];
					}
				});

				callback?.onSuccess?.();
			}
		}
	});

	return { createBoard, ...rest };
};
