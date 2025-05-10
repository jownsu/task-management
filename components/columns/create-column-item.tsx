"use client";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* ICONS */
import { FaPlus } from "react-icons/fa";

const CreateColumnItem = () => {
	const setModal = useBoardStore((state) => state.setModal);

	return (
		<button
			className="flex items-center w-[280] justify-center rounded-lg cursor-pointer text-h-xl text-medium-grey bg-[#E9EFFAFF] gap-[8] hover:text-primary dark:bg-foreground/25 shrink-0 mt-[39]"
			type="button"
			onClick={() => setModal("edit_board", true)}
		>
			<FaPlus className="size-[16]" /> New Column
		</button>
	);
};

export default CreateColumnItem;
