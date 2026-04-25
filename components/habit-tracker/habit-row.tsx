"use client";

/* COMPONENTS */
import HabitCell from "@/components/habit-tracker/habit-cell";

/* ICONS */
import { MdEdit } from "react-icons/md";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* UTILITIES */
import { buildDateString } from "@/lib/date-helpers";
import { cn } from "@/lib/utils";

/* TYPES */
import { Habit } from "@/types";

interface Props {
	habit: Habit;
	year: number;
	month_num: number;
	days_count: number;
	today_iso: string | null;
	logged_set: Set<string>;
	achieved: number;
	onToggle: (habit_id: string, date: string) => void;
}

/**
 * DOCU: Renders a single habit row: name + edit-on-hover (sticky left), one cell per day in the month, goal cell, achieved cell (sticky right). <br>
 * Triggered: For each habit in the habit-tracker grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const HabitRow = ({ habit, year, month_num, days_count, today_iso, logged_set, achieved, onToggle }: Props) => {
	const setModal = useBoardStore((state) => state.setModal);
	const setSelectedHabit = useBoardStore((state) => state.setSelectedHabit);

	const days = Array.from({ length: days_count }, (_, idx) => idx + 1);
	const goal_met = achieved >= habit.goal;

	const handleEditClick = () => {
		setSelectedHabit(habit);
		setModal("edit_habit", true);
	};

	return (
		<div className="contents">
			<div className="group sticky left-0 bg-foreground z-10 flex items-center justify-between gap-[8] px-[12] border-r border-b border-lines text-body-md">
				<span className="truncate">{habit.name}</span>
				<button
					type="button"
					onClick={handleEditClick}
					className="opacity-0 group-hover:opacity-100 transition-opacity text-medium-grey hover:text-primary cursor-pointer shrink-0"
					aria-label={`Edit habit ${habit.name}`}
				>
					<MdEdit className="size-[16]" />
				</button>
			</div>

			{days.map((day) => {
				const date = buildDateString(year, month_num, day);
				const is_logged = logged_set.has(`${habit.id}-${date}`);
				const is_today = date === today_iso;
				return (
					<HabitCell
						key={date}
						is_logged={is_logged}
						is_today={is_today}
						theme={habit.theme}
						onClick={() => onToggle(habit.id, date)}
					/>
				);
			})}

			<div className="sticky right-[80] bg-foreground z-10 flex items-center justify-center border-l border-r border-b border-lines text-body-md">
				{habit.goal}
			</div>
			<div
				className={cn(
					"sticky right-0 z-10 flex items-center justify-center border-b border-lines text-body-md font-bold",
					goal_met ? "bg-emerald-300 text-black" : "bg-yellow-200 text-black"
				)}
			>
				{achieved}
			</div>
		</div>
	);
};

export default HabitRow;
