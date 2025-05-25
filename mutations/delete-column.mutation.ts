/* SCHEMA */
import { CACHE_KEY_COLUMN } from "@/constants/query-keys";
import { DeleteColumnSchemaType } from "@/schema/column-schema";

/* ACTIONS */
import { deleteColumnAction } from "@/server/actions/column/delete-column.action";

/* TYPES */
import { CallbackResponse, Column } from "@/constants/types";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteColumn = (board_id: string, callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: deleteColumn, ...rest } = useMutation({
		mutationFn: (payload: DeleteColumnSchemaType) => deleteColumnAction(payload),
		onSuccess: (response, payload) => {
            if(response?.data?.status){
                queryClient.setQueryData<Column[]>([...CACHE_KEY_COLUMN, board_id], (columns) => {
                    if(columns){
                        return columns.filter(column => column.id !== payload.id)
                    }

                    return columns;
                })

                callback?.onSuccess?.();
            }
        }
	});

	return { deleteColumn, ...rest };
};
