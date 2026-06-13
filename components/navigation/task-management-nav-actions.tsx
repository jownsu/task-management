"use client";

/* COMPONENTS */
import ActionOptions from "@/components/actions-dropdown";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* QUERIES */
import { useGetTaskManagementBoard } from "@/hooks/queries/task-management-board.query";

interface Props {
	board_id: string;
}

/**
 * DOCU: Renders the board action options dropdown (edit, delete, edit tags) for a task-management board. <br>
 * Triggered: From the navbar when the active board is of type TASK_MANAGEMENT. <br>
 * Last Updated: June 13, 2026
 * @author Jhones
 */
const TaskManagementNavActions = ({ board_id }: Props) => {
	const setBoardModal = useBoardStore((state) => state.setModal);
	const setSelectedBoard = useBoardStore((state) => state.setSelectedBoard);

	const { board: task_management_board } = useGetTaskManagementBoard(board_id);

	return (
		<>
			<ActionOptions
				name="Board"
				onDeleteClick={() => {
					if (task_management_board) {
						setBoardModal("delete_board", true);
						setSelectedBoard(task_management_board);
					}
				}}
				onEditClick={() => {
					if (task_management_board) {
						setBoardModal("edit_board", true);
						setSelectedBoard(task_management_board);
					}
				}}
				onEditTagsClick={() => {
					if (task_management_board) {
						setBoardModal("edit_tags", true);
						setSelectedBoard(task_management_board);
					}
				}}
			/>
		</>
	);
};

export default TaskManagementNavActions;
