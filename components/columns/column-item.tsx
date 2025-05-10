/* COMPONENTS */
import TaskItem from "@/components/columns/task-item";

/* TYPES */
import { ColumnWithTasks } from "@/constants/types";

interface Props {
	column: ColumnWithTasks;
}

const ColumnItem = ({ column }: Props) => {
	return (
		<div className="shrink-0 w-[280] flex flex-col gap-[24]">
			<div className="flex items-center gap-[12]">
				<span className="size-[15] rounded-full bg-blue-500 block"></span>
				<span className="text-h-sm text-medium-grey uppercase">
					{column.title} ({column.tasks.length})
				</span>
			</div>

			<div className="flex flex-col gap-[20]">
				{column.tasks.map((task) => (
					<TaskItem key={task.id} task={task} />
				))}
			</div>
		</div>
	);
};

export default ColumnItem;
