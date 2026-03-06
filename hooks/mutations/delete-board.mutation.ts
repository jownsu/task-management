/* NEXT */
import { useRouter } from "next/navigation";

/* ACTIONS */
import { deleteBoardAction } from "@/actions/board.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { DeleteBoardSchema } from "@/schema/board-schema";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
