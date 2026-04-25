/* COMPONENTS */
import EditHabitBoardModal from "@/components/board/edit-habit-board-modal";
import DeleteBoardModal from "@/components/board/delete-board-modal";

/**
 * DOCU: Renders the habit tracker board view. Currently a placeholder stub. <br>
 * Triggered: On the board detail page when board.type is HABIT_TRACKER. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const HabitTrackerBoard = () => {
	return (
		<div className="p-[24]">
			<h1 className="text-h-xl">Habit Tracker</h1>

			{/* MODALS */}
			<EditHabitBoardModal />
			<DeleteBoardModal />
		</div>
	);
};

export default HabitTrackerBoard;
