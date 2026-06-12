"use client";

/* REACT */
import { useRef, useState } from "react";

/* COMPONENTS */
import HabitDayChip from "@/components/habit-tracker/habit-day-chip";

/* PLUGINS */
import { useSortable } from "@dnd-kit/react/sortable";

/* ICONS */
import { MdEdit, MdDragIndicator } from "react-icons/md";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* UTILITIES */
import { buildDateString } from "@/lib/date-helpers";
import { cn } from "@/lib/utils";

/* TYPES */
import { Habit } from "@/types";

interface Props {
	habit: Habit;
	index: number;
	year: number;
	month_num: number;
	days_count: number;
	today_iso: string | null;
	logged_set: Set<string>;
	achieved: number;
	is_disabled: boolean;
	is_reordering: boolean;
	onToggle: (habit_id: string, date: string) => void;
}

/**
 * DOCU: Sortable habit card: drag handle + name + achieved/goal + edit button, followed by a wrapping calendar of numbered day chips. While is_disabled (a toggle is in flight) the day chips are blocked to prevent click-spamming; is_reordering disables dragging while a reorder persists. <br>
 * Triggered: For each habit in HabitGrid. <br>
 * Last Updated: May 30, 2026
 * @author Jhones
 */
const HabitCard = ({ habit, index, year, month_num, days_count, today_iso, logged_set, achieved, is_disabled, is_reordering, onToggle }: Props) => {
	const setModal = useBoardStore((state) => state.setModal);
	const setSelectedHabit = useBoardStore((state) => state.setSelectedHabit);

	const [element, setElement] = useState<Element | null>(null);
	const handle_ref = useRef<HTMLButtonElement | null>(null);

	const { isDragging } = useSortable({
		id: habit.id,
		index,
		element,
		handle: handle_ref,
		type: "habit-card",
		accept: "habit-card",
		group: "habits",
		disabled: is_reordering
	});

	const days = Array.from({ length: days_count }, (_, idx) => idx + 1);
	const goal_met = achieved >= habit.goal;

	const handleEditClick = () => {
		setSelectedHabit(habit);
		setModal("edit_habit", true);
	};

	return (
		<div
			ref={setElement}
			className={cn(
				"flex flex-col gap-[12] border border-lines rounded-md p-[12] bg-foreground",
				isDragging && "border-dashed border-2 border-primary !bg-transparent",
				is_reordering && "opacity-50 pointer-events-none"
			)}
		>
			<div className={cn("flex items-center justify-between gap-[8]", isDragging && "opacity-0")}>
				<div className="flex items-center gap-[8] min-w-0">
					<button
						ref={handle_ref}
						type="button"
						className={cn("text-medium-grey hover:text-primary cursor-grab touch-none shrink-0", is_reordering && "cursor-not-allowed")}
						aria-label={`Reorder habit ${habit.name}`}
					>
						<MdDragIndicator className="size-[16]" />
					</button>
					<span className="truncate text-body-md font-bold">{habit.name}</span>
				</div>
				<div className="flex items-center gap-[8] shrink-0">
					<span className={cn("text-body-md", goal_met ? "text-success" : "text-medium-grey")}>
						<span className="font-bold">{achieved}</span> / {habit.goal}
					</span>
					<button
						type="button"
						onClick={handleEditClick}
						className="text-medium-grey hover:text-primary cursor-pointer"
						aria-label={`Edit habit ${habit.name}`}
					>
						<MdEdit className="size-[16]" />
					</button>
				</div>
			</div>

			<div className={cn("flex flex-wrap gap-[6] transition-opacity", is_disabled && "pointer-events-none opacity-50", isDragging && "opacity-0")} aria-busy={is_disabled}>
				{days.map((day) => {
					const date = buildDateString(year, month_num, day);
					return (
						<HabitDayChip
							key={date}
							day={day}
							is_logged={logged_set.has(`${habit.id}-${date}`)}
							is_today={date === today_iso}
							theme={habit.theme}
							is_disabled={is_disabled}
							onClick={() => onToggle(habit.id, date)}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default HabitCard;
