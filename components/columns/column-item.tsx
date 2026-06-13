"use client";

/* COMPONENTS */
import TaskItem from "@/components/columns/task-item";
import QuickAddTask from "@/components/columns/quick-add-task";
import CompletedSection from "@/components/columns/completed-section";

/* PLUGINS */
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";

/* HOOKS */
import { useFilteredTasks } from "@/hooks/use-filtered-tasks";

/* TYPES */
import { Column } from "@/types";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	column: Column;
	is_reordering?: boolean;
}

/**
 * DOCU: Renders a single column — its header (with incomplete task count), the draggable incomplete task list, the collapsible completed section, and the quick-add input. <br>
 * Triggered: For each column in the task-management board's ColumnList. <br>
 * Last Updated: June 13, 2026
 * @author Jhones
 */
const ColumnItem = ({ column, is_reordering }: Props) => {

	const filtered_tasks = useFilteredTasks(column.tasks || []);
	const incomplete_tasks = filtered_tasks.filter((task) => !task.isCompleted);
	const completed_tasks = filtered_tasks.filter((task) => task.isCompleted);

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
					{column.name} ({incomplete_tasks.length})
				</span>
			</div>

			<div
				ref={ref}
				className={cn("flex flex-col gap-[20] min-h-full h-full rounded-lg")}
			>
				{incomplete_tasks.map((task, index) => (
					<TaskItem
						key={task.id}
						task={task}
						column_id={column.id}
						index={index}
						disabled={is_reordering}
					/>
				))}
				<QuickAddTask column_id={column.id} />
				<CompletedSection
					column_id={column.id}
					completed_tasks={completed_tasks}
					index_offset={incomplete_tasks.length}
				/>
			</div>
		</div>
	);
};

export default ColumnItem;
