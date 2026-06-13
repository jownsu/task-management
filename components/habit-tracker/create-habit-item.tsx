"use client";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* ICONS */
import { FaPlus } from "react-icons/fa";

/**
 * DOCU: Ghost placeholder cell rendered as the last item of the habit grid; opens the add-habit modal. Stretches to match sibling habit cards in the same row and doubles as the empty-state call-to-action when the board has no habits yet. <br>
 * Triggered: When the user clicks "+ Add New Habit" at the end of the habit grid. <br>
 * Last Updated: June 13, 2026
 * @author Jhones
 */
const CreateHabitItem = () => {
	const setModal = useBoardStore((state) => state.setModal);

	return (
		<button
			type="button"
			onClick={() => setModal("add_habit", true)}
			className="flex h-full flex-col items-center justify-center gap-[8] rounded-lg border-2 border-dashed border-lines bg-[#E9EFFAFF] py-[48] text-h-lg text-medium-grey cursor-pointer transition-colors hover:border-primary hover:text-primary dark:bg-foreground/25"
		>
			<FaPlus className="size-[16]" /> Add New Habit
		</button>
	);
};

export default CreateHabitItem;
