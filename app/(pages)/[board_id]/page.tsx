/* COMPONENTS */
import ColumnList from "@/components/columns/column-list";
import CreateTaskModal from "@/components/task/create-task-modal";

/* PLUGINS */
import { HydrationBoundary } from "@tanstack/react-query";

/* QUERIES */
import { prefetchColumn } from "@/queries/column.query";

interface Props {
	params: {
		board_id: string;
	}
}

const TaskPage = async ({ params }: Props) => {
	const { board_id } = await params as { board_id: string };
	const prefetched_columns = await prefetchColumn(board_id);

	return (
		<div className="h-full overflow-auto p-[24]">
			<HydrationBoundary state={prefetched_columns}>
				<ColumnList />
			</HydrationBoundary>

			{/* MODALS */}
			<CreateTaskModal />
		</div>
	);
};

export default TaskPage;
