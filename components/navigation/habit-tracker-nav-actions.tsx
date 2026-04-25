"use client";

/* COMPONENTS */
import ActionOptions from "@/components/actions-dropdown";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* QUERIES */
import { useGetHabitTrackerBoard } from "@/hooks/queries/habit-tracker-board.query";

interface Props {
	board_id: string;
}

/**
 * DOCU: Renders the board action options dropdown (edit + delete) for a habit-tracker board. <br>
 * Triggered: From the navbar when the active board is of type HABIT_TRACKER. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const HabitTrackerNavActions = ({ board_id }: Props) => {
	const setBoardModal = useBoardStore((state) => state.setModal);
	const setSelectedBoard = useBoardStore((state) => state.setSelectedBoard);

	const { board: habit_tracker_board } = useGetHabitTrackerBoard(board_id);

	return (
		<ActionOptions
			name="Board"
			onDeleteClick={() => {
				if (habit_tracker_board) {
					setBoardModal("delete_board", true);
					setSelectedBoard(habit_tracker_board);
				}
			}}
			onEditClick={() => {
				if (habit_tracker_board) {
					setBoardModal("edit_board", true);
					setSelectedBoard(habit_tracker_board);
				}
			}}
		/>
	);
};

export default HabitTrackerNavActions;
