"use client";

/* COMPONENTS */
import MainContainer from "@/components/main-container";
import { Button } from "@/components/ui/button";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* QUERIES */
import { useGetAllBoards } from "@/hooks/queries/all_boards.query";

/* ICONS */
import { LuKanban, LuPlus, LuLayoutDashboard } from "react-icons/lu";

/**
 * DOCU: Home page displayed when no board is selected. Guides the user to select or create a board. <br>
 * Triggered: When the user navigates to the root "/" route. <br>
 * Last Updated: March 6, 2026
 * @author Jhones
 */
const HomePage = () => {
	const set_modal = useBoardStore((state) => state.setModal);
	const { boards } = useGetAllBoards();

	const has_boards = boards && boards.length > 0;

	return (
		<MainContainer className="flex h-screen items-center justify-center">
			<div className="flex flex-col items-center gap-[24] px-[24] text-center">
				<div className="flex size-[80] items-center justify-center rounded-full bg-primary/10">
					<LuKanban className="size-[40] text-primary" />
				</div>

				{has_boards ? (
					<>
						<div className="flex flex-col gap-[8]">
							<h1 className="!text-h-xl text-black dark:text-white">Welcome to Kanban</h1>
							<p className="text-b-lg text-medium-grey max-w-[400]">Select a board from the sidebar to get started, or create a new one.</p>
						</div>

						<div className="flex flex-col items-center gap-[12]">
							<Button type="button" className="h-[48] md:!px-[24]" onClick={() => set_modal("add_board", true)}>
								<LuPlus className="size-[12]" /> Create New Board
							</Button>
							<p className="text-b-md flex items-center gap-[6] text-medium-grey">
								<LuLayoutDashboard className="size-[14]" /> You have {boards.length} board{boards.length !== 1 && "s"}
							</p>
						</div>
					</>
				) : (
					<>
						<div className="flex flex-col gap-[8]">
							<h1 className="!text-h-xl text-black dark:text-white">Welcome to Kanban</h1>
							<p className="text-b-lg text-medium-grey max-w-[400]">You don&apos;t have any boards yet. Create your first board to start managing your tasks.</p>
						</div>

						<Button type="button" className="h-[48] md:!px-[24]" onClick={() => set_modal("add_board", true)}>
							<LuPlus className="size-[12]" /> Create Your First Board
						</Button>
					</>
				)}
			</div>
		</MainContainer>
	);
};

export default HomePage;
