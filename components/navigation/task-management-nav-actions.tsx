"use client";

/* COMPONENTS */
import ActionOptions from "@/components/actions-dropdown";
import { Button } from "@/components/ui/button";

/* ICONS */
import { FaPlus } from "react-icons/fa";

/* STORE */
import { useBoardStore } from "@/store/board.store";
import { useTaskStore } from "@/store/task.store";

/* QUERIES */
import { useGetTaskManagementBoard } from "@/hooks/queries/task-management-board.query";

interface Props {
	board_id: string;
}

/**
 * DOCU: Renders the Add New Task button and board action options dropdown for a task-management board. <br>
 * Triggered: From the navbar when the active board is of type TASK_MANAGEMENT. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const TaskManagementNavActions = ({ board_id }: Props) => {
	const setBoardModal = useBoardStore((state) => state.setModal);
	const setSelectedBoard = useBoardStore((state) => state.setSelectedBoard);
	const setTaskModal = useTaskStore((state) => state.setModal);

	const { board: task_management_board } = useGetTaskManagementBoard(board_id);

	return (
		<>
			<Button type="button" className="text-md h-[32] w-[48] md:h-[48] md:w-fit md:!px-[24]" onClick={() => setTaskModal("add_task", true)}>
				<FaPlus className="size-[12]" /> <span className="hidden md:block">Add New Task</span>
			</Button>
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
