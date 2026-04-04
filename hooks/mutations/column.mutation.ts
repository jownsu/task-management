/* ACTIONS */
import { createColumnAction, deleteColumnAction } from "@/actions/column.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { AddColumnSchema, DeleteColumnSchemaType } from "@/schema/column-schema";

/* TYPES */
import { Board, CallbackResponse, Column } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARD } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * DOCU: Will create a new column for the current board. <br>
 * Triggered: On submission of add column form. <br>
 * Last Updated: March 11, 2026
 * @author Jhones
 */
export const useCreateColumn = (callback?: CallbackResponse<Column>) => {
	const queryClient = useQueryClient();

	const { mutate: createColumn, ...rest } = useMutation({
		mutationFn: (payload: AddColumnSchema) => executeAction(createColumnAction(payload)),
		onSuccess: (response, payload) => {
			if (response) {
				queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
					if (board) {
						return {
							...board,
							columnOrder: [...board.columnOrder, response.id],
							columns: [...(board.columns || []), response]
						};
					}
				});

				callback?.onSuccess?.(response);
			}
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		}
	});

	return { createColumn, ...rest };
};

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
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		}
	});

	return { deleteColumn, ...rest };
};
