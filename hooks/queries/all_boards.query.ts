/* NEXT */
import { dehydrate, useQuery } from "@tanstack/react-query";

/* CONSTANTS */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";

/* UTILITIES */
import getQueryClient from "@/lib/get-query-client";

/* ACTIONS */
import { getAllBoards } from "@/actions/board.actions";

/**
 * DOCU: Will prefetch all boards for sidebar. <br>
 * Triggered: On load of the page. <br>
 * Last Updated: December 30, 2024
 * @author Jhones
 */
export const prefetchAllBoards = async () => {
	const queryClient = getQueryClient();

	await queryClient.prefetchQuery({
		queryKey: CACHE_KEY_BOARDS,
		queryFn: () => getAllBoards()
	});

	return dehydrate(queryClient);
};

/**
 * DOCU: Will get all boards for sidebar. <br>
 * Triggered: On load of the page. <br>
 * Last Updated: December 30, 2024
 * @author Jhones
 */
export const useGetAllBoards = () => {
	const { data: boards, ...rest } = useQuery({
		queryKey: CACHE_KEY_BOARDS,
		queryFn: () => getAllBoards()
	});

	return { boards, ...rest };
};
