/* NEXT */
import { dehydrate, useQuery } from "@tanstack/react-query";

/* CONSTANTS */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";

/* UTILITIES */
import getQueryClient from "@/lib/get-query-client"

/* ACTIONS */
import { getBoardAction } from "@/server/actions/board/get-board.action";

const getBoardQueryFn = async () => {
    const response = await getBoardAction();
            
    if(response?.data?.status){
        return response?.data.data;
    }

    return [];
}

export const prefetchBoard = async () => {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: CACHE_KEY_BOARDS,
        queryFn: getBoardQueryFn
    });

	return dehydrate(queryClient);
};

export const useGetBoard = () => {
    const {data: boards, ...rest} = useQuery({
        queryKey: CACHE_KEY_BOARDS,
        queryFn: getBoardQueryFn
    });

    return { boards, ...rest}
}
