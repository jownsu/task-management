/* COMPONENTS */
import TaskItem from "@/components/columns/task-item";

/* PLUGINS */
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

/* TYPES */
import { Column } from "@/types";

interface Props {
	column: Column;
}

const ColumnItem = ({ column }: Props) => {
	const task_ids = column?.tasks?.map((task) => task.id) || [];

	return (
		<div className="shrink-0 w-[280] flex flex-col gap-[24]">
			<div className="flex items-center gap-[12]">
				<span className="size-[15] rounded-full bg-blue-500 block"></span>
				<span className="text-h-sm text-medium-grey uppercase">
					{column.name} ({column?.tasks?.length})
				</span>
			</div>

			<SortableContext items={task_ids} strategy={verticalListSortingStrategy}>
				<div className="flex flex-col gap-[20] min-h-[1]">
					{column?.tasks?.map((task) => (
						<TaskItem
							key={task.id}
							task={task}
							column_id={column.id}
						/>
					))}
				</div>
			</SortableContext>
		</div>
	);
};

export default ColumnItem;
