/* NEXT */
import { dehydrate, useQuery } from "@tanstack/react-query";

/* CONSTANTS */
import { CACHE_KEY_BOARD } from "@/constants/query-keys";

/* UTILITIES */
import getQueryClient from "@/lib/get-query-client"

/* ACTIONS */
import boardService from "@/services/board.service";

/**
 * DOCU: Will prefetch the selected board. <br>
 * Triggered: On load of specific board page. <br>
 */
export const prefetchBoard = async (board_id: string) => {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: [...CACHE_KEY_BOARD, board_id],
        queryFn: () => boardService.getBoard(board_id)
    });

	return dehydrate(queryClient);
};

/**
 * DOCU: Will get the selected board. <br>
 * Triggered: On load of specific board page. <br>
 */
export const useGetBoard = (board_id: string) => {
    const {data: board, ...rest} = useQuery({
        queryKey: [...CACHE_KEY_BOARD, board_id],
        queryFn: () => boardService.getBoard(board_id)
    });

    return { board, ...rest}
}
