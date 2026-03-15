"use client";

/* PLUGINS */
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* TYPES */
import { Task } from "@/types";

interface Props {
	column_id: string;
	task: Task;
}

const TaskItem = ({ task, column_id }: Props) => {
	const setModal = useTaskStore((state) => state.setModal);
	const setSelectedTask = useTaskStore((state) => state.setSelectedTask);
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id, data: { column_id } });

	const style = {
		transform: CSS.Translate.toString(transform),
		transition
	};

	return (
		<button
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="bg-foreground rounded-lg px-[16] py-[24] text-left flex flex-col gap-[8] drop-shadow-md cursor-pointer group w-full !h-fit"
			type="button"
			onClick={() => {
				setModal("view_task", true);
				setSelectedTask(task.id, column_id);
			}}
		>
			<p className="text-h-md text-black dark:text-white group-hover:text-primary dark:group-hover:text-primary">
				{task.title}
			</p>
			<p className="text-b-md text-medium-grey">{task?.subtasks.filter(subtask => subtask.isCompleted).length} of {task?.subtasks?.length} subtasks</p>
		</button>
	);
};

export default TaskItem;
