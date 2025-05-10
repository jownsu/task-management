"use client";

/* COMPONENTS */
import { Button } from "@/components/ui/button";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* ICONS */
import { FaPlus } from "react-icons/fa";

const CreateColumnButton = () => {
	const setModal = useBoardStore((state) => state.setModal);

	return (
		<Button
			size={"lg"}
			className="!text-h-md"
			onClick={() => setModal("edit_board", true)}
		>
			<FaPlus className="size-[10]" /> Add New Column
		</Button>
	);
};

export default CreateColumnButton;
