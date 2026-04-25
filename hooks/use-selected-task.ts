/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useMemo } from "react";

/* QUERIES */
import { useGetTaskManagementBoard } from "@/hooks/queries/task-management-board.query";

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
	const { board } = useGetTaskManagementBoard(board_id);

	return useMemo(() => {
		if (!board || !selected_task_id) return null;

		for (const column of board.columns ?? []) {
			const task = column.tasks?.find((t) => t.id === selected_task_id);
			if (task) {
				return { ...task, column_id: column.id };
			}
		}

		return null;
	}, [board, selected_task_id]);
};
