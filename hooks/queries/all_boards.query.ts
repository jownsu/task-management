/* NEXT */
import { dehydrate, useQuery } from "@tanstack/react-query";

/* CONSTANTS */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";

/* UTILITIES */
import getQueryClient from "@/lib/get-query-client"

/* ACTIONS */
import boardService from "@/services/board.service";

/**
 * DOCU: Will prefetch all boards for sidebar. <br>
 * Triggered: On load of the page. <br>
 */
export const prefetchAllBoards = async () => {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: CACHE_KEY_BOARDS,
        queryFn: () => boardService.getAllBoards()
    });

	return dehydrate(queryClient);
};

/**
 * DOCU: Will get all boards for sidebar. <br>
 * Triggered: On load of the page. <br>
 */
export const useGetAllBoards = () => {
    const {data: boards, ...rest} = useQuery({
        queryKey: CACHE_KEY_BOARDS,
        queryFn: () => boardService.getAllBoards()
    });

    return { boards, ...rest}
}
