"use client";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* ICONS */
import IconBoardLink from "@/public/icon-board-link.svg";
import { FaPlus } from "react-icons/fa";

const CreateBoardButton = () => {
	const setModal = useBoardStore((state) => state.setModal);

	return (
		<button
			type="button"
			className="flex items-center gap-[12] h-[48] pl-[24] rounded-r-full text-primary text-md hover:bg-primary/10 hover:text-primary cursor-pointer dark:hover:bg-white"
			onClick={() => setModal("add_board", true)}
		>
			<IconBoardLink />{" "}
			<span className="flex items-center gap-[4]">
				<FaPlus className="size-[10]" /> Create New board
			</span>
		</button>
	);
};

export default CreateBoardButton;
