"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* ICONS */
import { FaPlus } from "react-icons/fa";

const CreateColumnItem = () => {
	const setModal = useBoardStore((state) => state.setModal);
	const setSelectedBoard = useBoardStore((state) => state.setSelectedBoard);
	const { board_id } = useParams() as { board_id: string };
	const { board } = useGetBoard(board_id);

	return (
		<button
			className="flex items-center w-[280] justify-center rounded-lg cursor-pointer text-h-xl text-medium-grey bg-[#E9EFFAFF] gap-[8] hover:text-primary dark:bg-foreground/25 shrink-0 mt-[39]"
			type="button"
			onClick={() => {
				if(board){
					setModal("edit_board", true);
					setSelectedBoard(board);
				}
			}}
		>
			<FaPlus className="size-[16]" /> New Column
		</button>
	);
};

export default CreateColumnItem;
