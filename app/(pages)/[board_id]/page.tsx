/* COMPONENTS */
import ColumnList from "@/components/columns/column-list";
import CreateTaskModal from "@/components/task/create-task-modal";
import Navbar from "@/components/navigation/navbar";
import MainContainer from "@/components/main-container";

/* PLUGINS */
import { HydrationBoundary } from "@tanstack/react-query";

/* QUERIES */
import { prefetchBoard } from "@/hooks/queries/board.query";

interface Props {
	params: {
		board_id: string;
	}
}

const TaskPage = async ({ params }: Props) => {
	const { board_id } = await params as { board_id: string };
	const prefetched_board = await prefetchBoard(board_id);

	return (
		<HydrationBoundary state={prefetched_board}>
			<Navbar />
			<MainContainer className="pt-[64] md:pt-[81] lg:pt-[96]">
				<div className="h-full overflow-auto p-[24]">
					<ColumnList />

					{/* MODALS */}
					<CreateTaskModal />
				</div>
			</MainContainer>
		</HydrationBoundary>
	);
};

export default TaskPage;
