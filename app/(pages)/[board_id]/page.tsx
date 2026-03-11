/* COMPONENTS */
import ColumnList from "@/components/columns/column-list";
import CreateColumnModal from "@/components/columns/create-column-modal";
import CreateTaskModal from "@/components/task/create-task-modal";
import MainContainer from "@/components/main-container";
import EditBoardmodal from "@/components/board/edit-board-modal";
import DeleteBoardModal from "@/components/board/delete-board-modal";
import ViewTaskModal from "@/components/task/view-task-modal";
import EditTaskModal from "@/components/task/edit-task-modal";
import DeleteTaskModal from "@/components/task/delete-task-modal";
import Navbar from "@/components/navigation/navbar";

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
			<MainContainer>
				<div className="h-full overflow-auto p-[24]">
					<ColumnList />

					{/* MODALS */}
					<CreateColumnModal />
					<CreateTaskModal />
					<EditBoardmodal />
					<DeleteBoardModal />
					<ViewTaskModal />
					<EditTaskModal />
					<DeleteTaskModal />
				</div>
			</MainContainer>
		</HydrationBoundary>
	);
};

export default TaskPage;
