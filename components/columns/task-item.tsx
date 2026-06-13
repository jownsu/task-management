"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useEffect, useRef, useState } from "react";

/* COMPONENTS */
import CardConfetti from "@/components/columns/card-confetti";

/* PLUGINS */
import { useSortable } from "@dnd-kit/react/sortable";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* HOOKS */
import { useFilterParams } from "@/hooks/use-filter-params";

/* MUTATIONS */
import { useToggleTaskComplete } from "@/hooks/mutations/task.mutation";

/* TYPES */
import { Task } from "@/types";

/* UTILITIES */
import { cn } from "@/lib/utils";
import { getContrastColor } from "@/lib/helpers";

/* ICONS */
import { MdDragIndicator, MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";

/* Celebration window in ms. MUST match the animation durations in globals.css (.animate-celebrate / .confetti-particle). */
const CELEBRATION_DURATION_MS = 700;

interface Props {
	column_id: string;
	task: Task;
	index: number;
	disabled?: boolean;
	is_completed_section?: boolean;
}

const TaskItem = ({ task, column_id, index, disabled, is_completed_section }: Props) => {
	const { board_id } = useParams() as { board_id: string };
	const setModal = useTaskStore((state) => state.setModal);
	const setSelectedTask = useTaskStore((state) => state.setSelectedTask);
	const { is_filters_active } = useFilterParams();
	const [element, setElement] = useState<Element | null>(null);
	const handleRef = useRef<HTMLButtonElement | null>(null);
	const { toggleTaskComplete, isPending: is_toggling } = useToggleTaskComplete();
	const [is_celebrating, setIsCelebrating] = useState(false);
	const celebration_timeout_ref = useRef<ReturnType<typeof setTimeout> | null>(null);
	/* Holds the deferred completion write during a celebration so an early unmount can flush it instead of silently dropping it. */
	const pending_complete_ref = useRef<(() => void) | null>(null);

	useEffect(() => {
		return () => {
			if (celebration_timeout_ref.current) {
				clearTimeout(celebration_timeout_ref.current);
			}
			/* If the card unmounts before the celebration timer fired, flush the pending completion so the write is never lost. */
			pending_complete_ref.current?.();
			pending_complete_ref.current = null;
		};
	}, []);

	const { isDragging } = useSortable({
		id: task.id,
		index,
		element,
		handle: handleRef,
		type: "task",
		accept: "task",
		group: column_id,
		disabled: disabled || is_filters_active || is_completed_section
	});

	/**
	 * DOCU: Toggles the task's completion. Completing an incomplete task plays a confetti + wiggle celebration, then fires the mutation after the celebration window; un-completing (or reduced-motion) toggles immediately. <br>
	 * Triggered: On clicking the checkmark button on the task card. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const onToggleComplete = (event: React.MouseEvent) => {
		event.stopPropagation();

		/* Ignore extra clicks while a celebration is already running. */
		if (is_celebrating) return;

		const next_completed = !task.isCompleted;
		const prefers_reduced_motion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		/* Celebrate only when completing (not un-completing) and motion is allowed. */
		if (next_completed && !prefers_reduced_motion) {
			setIsCelebrating(true);
			/* Defer the write until the celebration finishes, but stash it so an early unmount can flush it (see cleanup effect). */
			pending_complete_ref.current = () => toggleTaskComplete({ board_id, column_id, task_id: task.id, isCompleted: true });
			celebration_timeout_ref.current = setTimeout(() => {
				pending_complete_ref.current?.();
				pending_complete_ref.current = null;
				celebration_timeout_ref.current = null;
				setIsCelebrating(false);
			}, CELEBRATION_DURATION_MS);
			return;
		}

		/* Un-complete, or reduced motion: toggle immediately. */
		toggleTaskComplete({ board_id, column_id, task_id: task.id, isCompleted: next_completed });
	};

	const show_completed = task.isCompleted || is_celebrating;

	return (
		<div key={task.id} ref={setElement} className={cn(
			"relative bg-foreground rounded-lg flex items-center drop-shadow-md px-[16] py-[24] group transition-opacity",
			isDragging && "border-dashed border-2 border-primary !bg-transparent",
			disabled && "opacity-50 pointer-events-none",
			task.isCompleted && "border border-success/30 bg-success/5",
			is_celebrating && "animate-celebrate"
		)}>
			{is_celebrating && <CardConfetti />}
			<button
				type="button"
				className={cn(
					"shrink-0 mr-[12] cursor-pointer transition-colors",
					show_completed ? "text-success" : "text-medium-grey hover:text-success",
					isDragging && "opacity-0",
					is_toggling && "opacity-50 pointer-events-none",
					is_celebrating && "pointer-events-none"
				)}
				onClick={onToggleComplete}
				aria-label={task.isCompleted ? "Mark task as incomplete" : is_celebrating ? "Task completed" : "Mark task as done"}
			>
				{show_completed ? <MdCheckCircle size={22} /> : <MdRadioButtonUnchecked size={22} />}
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
				{task.tags.length > 0 && (
					<div className="flex flex-wrap gap-[4]">
						{task.tags.map((tag) => (
							<span
								key={tag.id}
								className="t-[11] font-bold px-[10] py-[3] rounded-full"
								style={{
									backgroundColor: tag.color,
									color: getContrastColor(tag.color)
								}}
							>
								{tag.name}
							</span>
						))}
					</div>
				)}
			</button>

			{!is_filters_active && !is_completed_section && (
				<button ref={handleRef} type="button" className={cn("cursor-grab touch-none text-primary/70 transition-opacity", isDragging ? "opacity-0" : "opacity-100 group-hover:opacity-100")}>
					<MdDragIndicator size={20} />
				</button>
			)}
		</div>
	);
};

export default TaskItem;
