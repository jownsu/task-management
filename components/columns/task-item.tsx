/* CONSTANTS */
import { Task } from "@/constants/types";

interface Props {
	task: Task;
}

const TaskItem = ({ task }: Props) => {
	return (
		<button
			className="bg-foreground rounded-lg px-[16] py-[24] text-left flex flex-col gap-[8] drop-shadow-md cursor-pointer group"
			type="button"
		>
			<p className="text-h-md text-black dark:text-white group-hover:text-primary dark:group-hover:text-primary">
				{task.title}
			</p>
			<p className="text-b-md text-medium-grey">0 of 3 subtasks</p>
		</button>
	);
};

export default TaskItem;
