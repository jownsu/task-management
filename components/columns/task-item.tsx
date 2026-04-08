"use client";

/* REACT */
import { useRef, useState } from "react";

/* NEXT */
import { useParams } from "next/navigation";

/* PLUGINS */
import { useSortable } from "@dnd-kit/react/sortable";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* MUTATIONS */
import { useToggleTaskComplete } from "@/hooks/mutations/task.mutation";

/* TYPES */
import { Task } from "@/types";

/* UTILITIES */
import { cn } from "@/lib/utils";

/* ICONS */
import { MdDragIndicator, MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";

interface Props {
	column_id: string;
	task: Task;
	index: number;
	disabled?: boolean;
}

const TaskItem = ({ task, column_id, index, disabled }: Props) => {
	const { board_id } = useParams() as { board_id: string };
	const setModal = useTaskStore((state) => state.setModal);
	const setSelectedTask = useTaskStore((state) => state.setSelectedTask);
	const [element, setElement] = useState<Element | null>(null);
	const handleRef = useRef<HTMLButtonElement | null>(null);
	const { toggleTaskComplete, isPending: is_toggling } = useToggleTaskComplete();
	const { isDragging } = useSortable({
		id: task.id,
		index,
		element,
		handle: handleRef,
		type: "task",
		accept: "task",
		group: column_id,
		disabled
	});

	/**
	 * DOCU: Toggles the completion status of the task. <br>
	 * Triggered: On clicking the checkmark button on the task card. <br>
	 * Last Updated: April 09, 2026
	 * @author Jhones
	 */
	const onToggleComplete = (event: React.MouseEvent) => {
		event.stopPropagation();
		toggleTaskComplete({
			board_id,
			column_id,
			task_id: task.id,
			isCompleted: !task.isCompleted
		});
	};

	return (
		<div key={task.id} ref={setElement} className={cn(
			"bg-foreground rounded-lg flex items-center drop-shadow-md px-[16] py-[24] group transition-opacity",
			isDragging && "border-dashed border-2 border-primary !bg-transparent",
			disabled && "opacity-50 pointer-events-none",
			task.isCompleted && "border border-success/30 bg-success/5"
		)}>
			<button
				type="button"
				className={cn(
					"shrink-0 mr-[12] cursor-pointer transition-colors",
					task.isCompleted ? "text-success" : "text-medium-grey hover:text-success",
					isDragging && "opacity-0",
					is_toggling && "opacity-50 pointer-events-none"
				)}
				onClick={onToggleComplete}
				aria-label={task.isCompleted ? "Mark task as incomplete" : "Mark task as done"}
			>
				{task.isCompleted ? <MdCheckCircle size={22} /> : <MdRadioButtonUnchecked size={22} />}
			</button>

			<button
				className={cn("group flex cursor-pointer flex-col gap-[8] text-left flex-1", isDragging && "opacity-0")}
				type="button"
				onClick={() => {
					setModal("view_task", true);
					setSelectedTask(task.id, column_id);
				}}
			>
				<p className={cn(
					"!text-h-md group-hover:text-primary dark:group-hover:text-primary text-black dark:text-white",
					task.isCompleted && "line-through opacity-50"
				)}>{task.title}</p>
				{task?.subtasks?.length > 0 && (
					<p className="text-b-md text-medium-grey">
						{task?.subtasks.filter((subtask) => subtask.isCompleted).length} of {task?.subtasks?.length} subtasks
					</p>
				)}
			</button>

			<button ref={handleRef} type="button" className={cn("cursor-grab text-primary/70 transition-opacity", isDragging ? "opacity-0" : "opacity-100 group-hover:opacity-100")}>
				<MdDragIndicator size={20} />
			</button>
		</div>
	);
};

export default TaskItem;
