/* NEXT */
import { useParams } from "next/navigation";

/* PLUGINS */
import { useQueryClient } from "@tanstack/react-query";

/* TYPES */
import { Board } from "@/types/board";

/* CONSTANTS */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";

export const useGetActiveBoard = () => {
	const queryClient = useQueryClient();
	const { board_id } = useParams() as { board_id: string };

	const active_board = queryClient
		.getQueryData<Board[]>(CACHE_KEY_BOARDS)
		?.find((board) => board.id === board_id);

	return active_board ?? undefined;
};
