/* NEXT */
import { dehydrate, useQuery } from "@tanstack/react-query";

/* CONSTANTS */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";

/* UTILITIES */
import getQueryClient from "@/lib/get-query-client"

/* ACTIONS */
import boardService from "@/services/board.service";

export const prefetchBoard = async (board_id: string) => {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: CACHE_KEY_BOARDS,
        queryFn: () => boardService.getBoards(board_id)
    });

	return dehydrate(queryClient);
};

export const useGetBoard = (board_id: string) => {
    const {data: boards, ...rest} = useQuery({
        queryKey: CACHE_KEY_BOARDS,
        queryFn: () => boardService.getBoards(board_id)
    });

    return { boards, ...rest}
}
