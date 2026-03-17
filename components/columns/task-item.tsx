"use client";

/* REACT */
import { useRef, useState } from "react";

/* PLUGINS */
import { useSortable } from "@dnd-kit/react/sortable";
import { MdDragIndicator } from "react-icons/md";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* TYPES */
import { Task } from "@/types";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	column_id: string;
	task: Task;
	index: number;
}

const TaskItem = ({ task, column_id, index }: Props) => {
	const setModal = useTaskStore((state) => state.setModal);
	const setSelectedTask = useTaskStore((state) => state.setSelectedTask);
	const [element, setElement] = useState<Element | null>(null);
	const handleRef = useRef<HTMLButtonElement | null>(null);
	const { isDragging } = useSortable({ 
		id: task.id, 
		index, 
		element, 
		handle: handleRef, 
		type: "task",
		accept: "task",
		group: column_id
	});
	return (
		<div key={task.id} ref={setElement} className={cn("bg-foreground rounded-lg flex items-center drop-shadow-md px-[16] py-[24] group", isDragging && "border-dashed border-2 border-primary !bg-transparent")}>
			<button
				className={cn("group flex cursor-pointer flex-col gap-[8] text-left flex-1", isDragging && "opacity-0")}
				type="button"
				onClick={() => {
					setModal("view_task", true);
					setSelectedTask(task.id, column_id);
				}}
			>
				<p className="text-h-md group-hover:text-primary dark:group-hover:text-primary text-black dark:text-white">{task.title}</p>
				<p className="text-b-md text-medium-grey">
					{task?.subtasks.filter((subtask) => subtask.isCompleted).length} of {task?.subtasks?.length} subtasks
				</p>
			</button>

			<button ref={handleRef} type="button" className={cn("cursor-grab text-primary/70 transition-opacity", isDragging ? "opacity-0" : "opacity-100 group-hover:opacity-100")}>
				<MdDragIndicator size={20} />
			</button>
		</div>
	);
};

export default TaskItem;
