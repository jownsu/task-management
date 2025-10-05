/* NEXT */
import { useRouter } from "next/navigation";

/* SCHEMA */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";
import { DeleteBoardSchema } from "@/schema/board-schema";

/* SERVICES */
import boardService from "@/services/board.service";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DOCU: Will delete the selected board. <br>
 * Triggered: On submission of delete board form. <br>
 */
export const useDeleteBoard = (callback?: CallbackResponse) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	
	const { mutate: deleteBoard, ...rest } = useMutation({
		mutationFn: async (payload: DeleteBoardSchema) => boardService.deleteBoard(payload),
		onSuccess: (_, payload) => {
			queryClient.setQueryData<Board[]>(CACHE_KEY_BOARDS, (boards) => {
				if (boards){
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
