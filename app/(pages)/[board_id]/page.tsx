/* COMPONENTS */
import ColumnItem from "@/components/columns/column-item";
import CreateColumnItem from "@/components/columns/create-column-item";
import EmptyBoard from "@/components/columns/empty-board";
import CreateTaskModal from "@/components/task/create-task-modal";

/* CONSTANTS */
import { ColumnWithTasks } from "@/constants/types";

const COLUMNS: ColumnWithTasks[] = [
	{
		id: "1",
		title: "Todo",
		board_id: "12",
		tasks: [
			{
				id: "1",
				title: "Task one",
				column_id: "1",
				description: "Description"
			},
			{
				id: "2",
				title: "Task two",
				column_id: "1",
				description: "Description"
			},
			{
				id: "3",
				title: "Task three",
				column_id: "1",
				description: "Description"
			}
		]
	},
	{
		id: "2",
		title: "Doing",
		board_id: "21",
		tasks: [
			{
				id: "4",
				title: "Task four",
				column_id: "1",
				description: "Description"
			}
		]
	}
];

const TaskPage = () => {
	if (!COLUMNS.length) {
		return <EmptyBoard />;
	}

	return (
		<div className="h-full flex gap-[24] overflow-auto p-[24]">
			{COLUMNS.map((column) => (
				<ColumnItem key={column.id} column={column} />
			))}
			<CreateColumnItem />

			{/* MODALS */}
			<CreateTaskModal />
		</div>
	);
};

export default TaskPage;
