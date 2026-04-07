/* COMPONENTS */
import TaskItem from "@/components/columns/task-item";
import QuickAddTask from "@/components/columns/quick-add-task";

/* PLUGINS */
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";

/* TYPES */
import { Column } from "@/types";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	column: Column;
	is_reordering?: boolean;
}

const ColumnItem = ({ column, is_reordering }: Props) => {

	const {ref} = useDroppable({
		id: column.id,
		type: "column",
		accept: "task",
		collisionPriority: CollisionPriority.Low,
	});
  
	return (
		<div className="shrink-0 w-[280] flex flex-col gap-[24]">
			<div className="flex items-center gap-[12]">
				<span className="size-[15] rounded-full block" style={{ backgroundColor: column.theme }}></span>
				<span className="text-h-sm text-medium-grey uppercase">
					{column.name} ({column?.tasks?.length})
				</span>
			</div>
	
			<div
				ref={ref}
				className={cn("flex flex-col gap-[20] min-h-full h-full rounded-lg")}
			>
				{column?.tasks?.map((task, index) => (
					<TaskItem
						key={task.id}
						task={task}
						column_id={column.id}
						index={index}
						disabled={is_reordering}
					/>
				))}
				<QuickAddTask column_id={column.id} />
			</div>
		</div>
	);
};

export default ColumnItem;
