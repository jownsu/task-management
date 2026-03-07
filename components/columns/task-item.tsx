"use client";

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

	return (
		<button
			className="bg-foreground rounded-lg px-[16] py-[24] text-left flex flex-col gap-[8] drop-shadow-md cursor-pointer group"
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
