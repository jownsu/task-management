/* PLUGINS */
import { useQueryClient } from "@tanstack/react-query";

/* TYPES */
import { Board } from "@/types/board";

/* CONSTANTS */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";

export const useGetActiveBoard = (board_id: string) => {
	const queryClient = useQueryClient();

	const active_board = queryClient
		.getQueryData<Board[]>(CACHE_KEY_BOARDS)
		?.find((board) => board.id === board_id);

	return active_board ?? undefined;
};
