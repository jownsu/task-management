/* NEXT */
import { dehydrate, useQuery } from "@tanstack/react-query";

/* CONSTANTS */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";

/* UTILITIES */
import getQueryClient from "@/lib/get-query-client"

/* ACTIONS */
import boardService from "@/services/board.service";

export const prefetchAllBoards = async () => {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: CACHE_KEY_BOARDS,
        queryFn: () => boardService.getAllBoards()
    });

	return dehydrate(queryClient);
};

export const useGetAllBoards = () => {
    const {data: boards, ...rest} = useQuery({
        queryKey: CACHE_KEY_BOARDS,
        queryFn: () => boardService.getAllBoards()
    });

    return { boards, ...rest}
}
