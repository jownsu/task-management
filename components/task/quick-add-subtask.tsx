"use client";

/* REACT */
import { useRef, useState } from "react";

/* PLUGINS */
import { IoMdAdd } from "react-icons/io";

/* MUTATIONS */
import { useAddSubtask } from "@/hooks/mutations/task.mutation";

interface Props {
	board_id: string;
	column_id: string;
	task_id: string;
}

/**
 * DOCU: Inline input for quickly adding a subtask by title inside the view task modal. <br>
 * Triggered: Rendered inside ViewTaskModal below the subtask list. <br>
 * Last Updated: April 07, 2026
 * @author Jhones
 */
const QuickAddSubtask = ({ board_id, column_id, task_id }: Props) => {
	const [title, setTitle] = useState("");
	const input_ref = useRef<HTMLInputElement>(null);

	const { addSubtask, isPending } = useAddSubtask({
		onSuccess: () => {
			setTitle("");
			input_ref.current?.focus();
		}
	});

	/**
	 * DOCU: Submits the quick-add subtask form if the title is not empty. <br>
	 * Triggered: On Enter key press or clicking the add button. <br>
	 * Last Updated: April 07, 2026
	 * @author Jhones
	 */
	const handleSubmit = () => {
		const trimmed = title.trim();
		if (!trimmed || isPending) return;

		addSubtask({
			title: trimmed,
			board_id,
			column_id,
			task_id
		});
	};

	/**
	 * DOCU: Handles keyboard events for the quick-add subtask input. <br>
	 * Triggered: On keydown in the quick-add subtask input field. <br>
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

	return (
		<div className="bg-background rounded-md px-[12] py-[12] flex items-center gap-[8]">
			<input
				ref={input_ref}
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="+ Add New Subtask"
				disabled={isPending}
				className="flex-1 bg-transparent text-b-lg font-bold text-black dark:text-white placeholder:text-black/25 dark:placeholder:text-white/25 outline-none disabled:opacity-50"
			/>
			<button
				type="button"
				onClick={handleSubmit}
				disabled={!title.trim() || isPending}
				aria-label="Add subtask"
				className="text-primary hover:text-primary/80 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-opacity"
			>
				<IoMdAdd size={18} />
			</button>
		</div>
	);
};

export default QuickAddSubtask;
