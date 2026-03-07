/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useMemo } from "react";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/**
 * DOCU: Derives the selected task from the board cache using stored IDs. <br>
 * Triggered: When components need the full selected task data. <br>
 * Last Updated: March 07, 2026
 * @author Jhones
 */
export const useSelectedTask = () => {
	const params = useParams();
	const board_id = params.board_id as string | undefined;
	const selected_task_id = useTaskStore((state) => state.selected_task_id);
	const selected_column_id = useTaskStore((state) => state.selected_column_id);
	const { board } = useGetBoard(board_id ?? "", { enabled: !!board_id });

	return useMemo(() => {
		if (!board || !selected_task_id || !selected_column_id) return null;

		const column = board.columns?.find((col) => col.id === selected_column_id);
		const task = column?.tasks?.find((t) => t.id === selected_task_id);

		if (!task) return null;

		return { ...task, column_id: selected_column_id };
	}, [board, selected_task_id, selected_column_id]);
};
