"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* COMPONENTS */
import ActionOptions from "@/components/actions-dropdown";
import NavMobile from "@/components/navigation/nav-mobile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/* ICONS */
import IconKanban from "@/components/kanban-icon";
import { FaPlus } from "react-icons/fa";

/* STORE */
import { useBoardStore } from "@/store/board.store";
import { useTaskStore } from "@/store/task.store";
import { useNavigationStore } from "@/store/navigation.store";

/* QUERIES */
import { useGetAllBoards } from "@/hooks/queries/all_boards.query";
import { useGetTaskManagementBoard } from "@/hooks/queries/task-management-board.query";

/* UTILITIES */
import { cn } from "@/lib/utils";

const Navbar = () => {
	const is_sidebar_open = useNavigationStore((state) => state.is_sidebar_open);
	const setBoardModal = useBoardStore((state) => state.setModal);
	const setSelectedBoard = useBoardStore((state) => state.setSelectedBoard);
	const setTaskModal = useTaskStore((state) => state.setModal);

	const { board_id } = useParams() as { board_id?: string };
	const { boards, isLoading: is_loading_boards } = useGetAllBoards();
	const board_list_entry = boards?.find((board) => board.id === board_id);
	const is_task_management = board_list_entry?.type === "TASK_MANAGEMENT";

	const { board: task_management_board } = useGetTaskManagementBoard(is_task_management ? board_id : undefined);

	return (
		<nav className="bg-foreground fixed z-[99] flex h-[64] w-full justify-between px-[24] md:h-[81] lg:h-[96]">
			<div className="hidden gap-[24] md:flex items-center">
				<div
					className={cn("border-background flex border-r-2 pr-[24] delay-0 duration-500", {
						["pr-[109] delay-200 duration-300 lg:pr-[149]"]: is_sidebar_open,
					})}
				>
					<IconKanban />
				</div>
				{board_id && (is_loading_boards ? <Skeleton className="w-64 h-8" /> : <h1 className="!text-h-xl self-center">{board_list_entry?.name}</h1>)}
			</div>

			<NavMobile />

			<div className="flex items-center gap-[8] self-center md:gap-[16]">
				{board_id && is_task_management && (
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
				)}
			</div>
		</nav>
	);
};

export default Navbar;
