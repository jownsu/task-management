"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* COMPONENTS */
import NavMobile from "@/components/navigation/nav-mobile";
import TaskManagementNavActions from "@/components/navigation/task-management-nav-actions";
import HabitTrackerNavActions from "@/components/navigation/habit-tracker-nav-actions";
import { Skeleton } from "@/components/ui/skeleton";

/* ICONS */
import FlowBoardIcon from "@/components/flowboard-icon";

/* STORE */
import { useNavigationStore } from "@/store/navigation.store";

/* QUERIES */
import { useGetAllBoards } from "@/hooks/queries/all_boards.query";

/* SCHEMA */
import { BoardType } from "@/schema/board-schema";

/* UTILITIES */
import { cn } from "@/lib/utils";

const BOARD_NAV_ACTIONS: Record<BoardType, React.ComponentType<{ board_id: string }>> = {
	TASK_MANAGEMENT: TaskManagementNavActions,
	HABIT_TRACKER: HabitTrackerNavActions
};

const Navbar = () => {
	const is_sidebar_open = useNavigationStore((state) => state.is_sidebar_open);

	const { board_id } = useParams() as { board_id?: string };
	const { boards, isLoading: is_loading_boards } = useGetAllBoards();
	const board_list_entry = boards?.find((board) => board.id === board_id);
	const NavActions = board_list_entry ? BOARD_NAV_ACTIONS[board_list_entry.type] : null;

	return (
		<nav className="bg-foreground fixed z-[99] flex h-[64] w-full justify-between px-[24] md:h-[81] lg:h-[96]">
			<div className="hidden gap-[24] md:flex items-center">
				<div
					className={cn("border-background flex border-r-2 pr-[24] delay-0 duration-500", {
						["pr-[109] delay-200 duration-300 lg:pr-[149]"]: is_sidebar_open,
					})}
				>
					<FlowBoardIcon />
				</div>
				{board_id && (is_loading_boards ? <Skeleton className="w-64 h-8" /> : <h1 className="!text-h-xl self-center">{board_list_entry?.name}</h1>)}
			</div>

			<NavMobile />

			<div className="flex items-center gap-[8] self-center md:gap-[16]">
				{board_id && NavActions && <NavActions board_id={board_id} />}
			</div>
		</nav>
	);
};

export default Navbar;
