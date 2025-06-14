"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* COMPONENTS */
import ActionOptions from "@/components/actions-dropdown";
import NavMobile from "@/components/navigation/nav-mobile";
import { Button } from "@/components/ui/button";

/* ICONS */
import IconKanban from "@/components/kanban-icon";
import { FaPlus } from "react-icons/fa";

/* STORE */
import { useBoardStore } from "@/store/board.store";
import { useTaskStore } from "@/store/task.store";
import { useNavigationStore } from "@/store/navigation.store";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* UTILITIES */
import { cn } from "@/lib/utils";

const Navbar = () => {
	const is_sidebar_open = useNavigationStore((state) => state.is_sidebar_open);
	const setBoardModal = useBoardStore((state) => state.setModal);
	const setTaskModal = useTaskStore((state) => state.setModal);

	const { board_id } = useParams() as { board_id: string };
	const { board } = useGetBoard(board_id);

	return (
		<nav className="flex bg-foreground h-[64] md:h-[81] lg:h-[96] px-[24] justify-between z-[99] fixed w-full">
			<div className="gap-[24] hidden md:flex">
				<div
					className={cn(
						"border-r-2 border-background pr-[24] flex duration-500 delay-0",
						{
							["pr-[109] duration-300 delay-200 lg:pr-[149]"]:
								is_sidebar_open
						}
					)}
				>
					<IconKanban />
				</div>
				<h1 className="self-center !text-h-xl">{board?.title}</h1>
			</div>

			<NavMobile />

			<div className="self-center flex items-center gap-[8] md:gap-[16]">
				<Button
					type="button"
					className="text-md h-[32] w-[48] md:w-fit md:h-[48] md:!px-[24]"
					onClick={() => setTaskModal("add_task", true)}
				>
					<FaPlus className="size-[12]" />{" "}
					<span className="hidden md:block">Add New Task</span>
				</Button>
				<ActionOptions 
					name="Board" 
					onDeleteClick={() => setBoardModal("delete_board", true)}
					onEditClick={() => setBoardModal("edit_board", true)}
				/>
			</div>
		</nav>
	);
};

export default Navbar;
