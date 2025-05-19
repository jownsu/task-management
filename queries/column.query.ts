/* NEXT */
import { dehydrate, useQuery } from "@tanstack/react-query";

/* CONSTANTS */
import { CACHE_KEY_COLUMN } from "@/constants/query-keys";

/* UTILITIES */
import getQueryClient from "@/lib/get-query-client";

/* ACTIONS */
import { getColumnAction } from "@/server/actions/column/get-columns.action";

const getColumnQueryFn = async (board_id: string) => {
    const response = await getColumnAction(board_id);
            
    if(response?.status){
        return response.data;
    }

    return [];
}

export const prefetchColumn = async (board_id: string) => {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: [...CACHE_KEY_COLUMN, board_id],
        queryFn: () => getColumnQueryFn(board_id)
    });

	return dehydrate(queryClient);
};

export const useGetColumn = (board_id: string) => {
    const {data: columns, ...rest} = useQuery({
        queryKey: [...CACHE_KEY_COLUMN, board_id],
        queryFn: () => getColumnQueryFn(board_id)
    });

    return { columns, ...rest}
}
