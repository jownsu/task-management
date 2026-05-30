"use client";

/* COMPONENTS */
import HabitCard from "@/components/habit-tracker/habit-card";

/* TYPES */
import { Habit, HabitLog } from "@/types";

interface Props {
	habits: Habit[];
	logs: HabitLog[];
	year: number;
	month_num: number;
	days_count: number;
	today_iso: string | null;
	toggling_habit_ids: Set<string>;
	onToggle: (habit_id: string, date: string) => void;
}

/**
 * DOCU: Habit-tracker view. Renders one calendar HabitCard per habit in a responsive grid (1 column on mobile, auto-filling multiple columns on wider screens) for a consistent layout at every breakpoint. <br>
 * Triggered: From the habit-tracker board orchestrator when habits and logs are available. <br>
 * Last Updated: May 30, 2026
 * @author Jhones
 */
const HabitGrid = ({ habits, logs, year, month_num, days_count, today_iso, toggling_habit_ids, onToggle }: Props) => {
	const logged_set = new Set(logs.map((log) => `${log.habitId}-${log.date}`));
	const achieved_by_habit = new Map<string, number>();
	for (const log of logs) {
		achieved_by_habit.set(log.habitId, (achieved_by_habit.get(log.habitId) ?? 0) + 1);
	}

	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[16]">
			{habits.map((habit) => (
				<HabitCard
					key={habit.id}
					habit={habit}
					year={year}
					month_num={month_num}
					days_count={days_count}
					today_iso={today_iso}
					logged_set={logged_set}
					achieved={achieved_by_habit.get(habit.id) ?? 0}
					is_disabled={toggling_habit_ids.has(habit.id)}
					onToggle={onToggle}
				/>
			))}
		</div>
	);
};

export default HabitGrid;
