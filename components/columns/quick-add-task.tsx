"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useRef, useState } from "react";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* MUTATIONS */
import { useCreateTask } from "@/hooks/mutations/task.mutation";

/* ICONS */
import { IoMdAdd } from "react-icons/io";
import { MdOpenInFull } from "react-icons/md";

interface Props {
	column_id: string;
}

/**
 * DOCU: Inline input at the bottom of a column for quickly adding a task by title. <br>
 * Triggered: Rendered inside each ColumnItem below the task list. <br>
 * Last Updated: April 07, 2026
 * @author Jhones
 */
const QuickAddTask = ({ column_id }: Props) => {
	const { board_id } = useParams() as { board_id: string };
	const [title, setTitle] = useState("");
	const input_ref = useRef<HTMLInputElement>(null);
	const openAddTask = useTaskStore((state) => state.openAddTask);

	const { createTask, isPending } = useCreateTask({
		onSuccess: () => {
			setTitle("");
			input_ref.current?.focus();
		}
	});

	/**
	 * DOCU: Submits the quick-add task form if the title is not empty. <br>
	 * Triggered: On Enter key press or clicking the add button. <br>
	 * Last Updated: April 07, 2026
	 * @author Jhones
	 */
	const handleSubmit = () => {
		const trimmed = title.trim();
		if (!trimmed || isPending) return;

		createTask({
			title: trimmed,
			column_id,
			board_id,
			sub_tasks: []
		});
	};

	/**
	 * DOCU: Handles keyboard events for the quick-add input. <br>
	 * Triggered: On keydown in the quick-add input field. <br>
	 * Last Updated: April 07, 2026
	 * @author Jhones
	 */
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		}
		if (e.key === "Escape") {
			setTitle("");
			input_ref.current?.blur();
		}
	};

	/**
	 * DOCU: Promotes the current quick-add draft into the full create-task modal, pre-scoped to this column. <br>
	 * Triggered: On clicking the expand button in the quick-add row. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const handleOpenDetailed = () => {
		openAddTask(column_id, title.trim());
		setTitle("");
	};

	return (
		<div className="bg-foreground rounded-lg drop-shadow-md px-[16] py-[12] flex items-center gap-[8]">
			<input
				ref={input_ref}
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="+ Add New Task"
				disabled={isPending}
				className="flex-1 bg-transparent text-h-md text-black dark:text-white placeholder:text-black/25 dark:placeholder:text-white/25 outline-none disabled:opacity-50"
			/>
			<button
				type="button"
				onClick={handleOpenDetailed}
				disabled={isPending}
				aria-label="Add task with details"
				className="text-medium-grey hover:text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
			>
				<MdOpenInFull size={16} />
			</button>
			<button
				type="button"
				onClick={handleSubmit}
				disabled={!title.trim() || isPending}
				aria-label="Add task"
				className="text-primary hover:text-primary/80 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-opacity"
			>
				<IoMdAdd size={20} />
			</button>
		</div>
	);
};

export default QuickAddTask;
