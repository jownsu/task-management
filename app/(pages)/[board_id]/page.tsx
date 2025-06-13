/* COMPONENTS */
import ColumnList from "@/components/columns/column-list";
import CreateTaskModal from "@/components/task/create-task-modal";

interface Props {
	params: {
		board_id: string;
	}
}

const TaskPage = async ({ params }: Props) => {
	const { board_id } = await params as { board_id: string };

	return (
		<div className="h-full overflow-auto p-[24]">
			<ColumnList />

			{/* MODALS */}
			<CreateTaskModal />
		</div>
	);
};

export default TaskPage;
