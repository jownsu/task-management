/* NEXT */
import { dehydrate, useQuery } from "@tanstack/react-query";

/* CONSTANTS */
import { CACHE_KEY_BOARD } from "@/constants/query-keys";

/* UTILITIES */
import getQueryClient from "@/lib/get-query-client";

/* ACTIONS */
import { getBoardById } from "@/actions/board.actions";

/**
 * DOCU: Will prefetch the selected board. <br>
 * Triggered: On load of specific board page. <br>
 * Last Updated: December 30, 2024
 * @author Jhones
 */
export const prefetchBoard = async (board_id: string) => {
	const queryClient = getQueryClient();

	await queryClient.prefetchQuery({
		queryKey: [...CACHE_KEY_BOARD, board_id],
		queryFn: () => getBoardById(board_id)
	});

	return dehydrate(queryClient);
};

/**
 * DOCU: Will get the selected board. <br>
 * Triggered: On load of specific board page. <br>
 * Last Updated: December 30, 2024
 * @author Jhones
 */
export const useGetBoard = (board_id: string) => {
	const { data: board, ...rest } = useQuery({
		queryKey: [...CACHE_KEY_BOARD, board_id],
		queryFn: () => getBoardById(board_id)
	});

	return { board, ...rest };
};
