/* NEXT */
import { useParams } from "next/navigation";
import { useMemo } from "react";

/* CONSTANTS */
import { useGetBoard } from "@/queries/board.query";

export const useGetActiveBoard = () => {
	const { board_id } = useParams() as { board_id: string };

	const { boards } = useGetBoard();

	const active_board = useMemo(
		() => boards?.find((board) => board.id === board_id),
		[boards, board_id]
	);

	return active_board;
};
