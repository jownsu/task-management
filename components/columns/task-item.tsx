"use client";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* CONSTANTS */
import { TaskItem as TaskItemType } from "@/types";

interface Props {
	task: TaskItemType;
}

const TaskItem = ({ task }: Props) => {
	const setModal = useTaskStore((state) => state.setModal);
	
	return (
		<button
			className="bg-foreground rounded-lg px-[16] py-[24] text-left flex flex-col gap-[8] drop-shadow-md cursor-pointer group"
			type="button"
			onClick={() => setModal("view_task", true)}
		>
			<p className="text-h-md text-black dark:text-white group-hover:text-primary dark:group-hover:text-primary">
				{task.title}
			</p>
			<p className="text-b-md text-medium-grey">{task.completed_sub_task} of {task.total_subtask} subtasks</p>
		</button>
	);
};

export default TaskItem;
