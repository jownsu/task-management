/* ACTIONS */
import { deleteColumnAction } from "@/actions/column.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { DeleteColumnSchemaType } from "@/schema/column-schema";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARD } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DOCU: Will delete the selected column. <br>
 * Triggered: On submission of delete column form. <br>
 * Last Updated: March 07, 2026
 * @author Jhones
 */
export const useDeleteColumn = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: deleteColumn, ...rest } = useMutation({
		mutationFn: (payload: DeleteColumnSchemaType) => executeAction(deleteColumnAction(payload)),
		onSuccess: (_, payload) => {
			queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
				if (board) {
					board.columns = board?.columns?.filter(column => column.id != payload.column_id);
				}
				return board;
			});

			callback?.onSuccess?.();
		}
	});

	return { deleteColumn, ...rest };
};
