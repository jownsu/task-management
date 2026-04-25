"use client";

/* COMPONENTS */
import HabitGridHeader from "@/components/habit-tracker/habit-grid-header";
import HabitRow from "@/components/habit-tracker/habit-row";

/* TYPES */
import { Habit, HabitLog } from "@/types";

interface Props {
	habits: Habit[];
	logs: HabitLog[];
	year: number;
	month_num: number;
	days_count: number;
	today_iso: string | null;
	onToggle: (habit_id: string, date: string) => void;
}

/**
 * DOCU: The habit-tracker grid: header + one row per habit. Wrapped in a horizontally scrollable container with sticky left (Habits) and right (Goal, Achieved) columns. <br>
 * Triggered: From the habit-tracker board orchestrator when habits and logs are available. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const HabitGrid = ({ habits, logs, year, month_num, days_count, today_iso, onToggle }: Props) => {
	const logged_set = new Set(logs.map((log) => `${log.habitId}-${log.date}`));
	const achieved_by_habit = new Map<string, number>();
	for (const log of logs) {
		achieved_by_habit.set(log.habitId, (achieved_by_habit.get(log.habitId) ?? 0) + 1);
	}

	const grid_template_columns = `160px repeat(${days_count}, minmax(32px, 1fr)) 64px 80px`;

	return (
		<div className="overflow-x-auto border border-lines rounded-md">
			<div
				className="grid"
				style={{ gridTemplateColumns: grid_template_columns }}
			>
				<HabitGridHeader year={year} month_num={month_num} days_count={days_count} today_iso={today_iso} />

				{habits.map((habit) => (
					<HabitRow
						key={habit.id}
						habit={habit}
						year={year}
						month_num={month_num}
						days_count={days_count}
						today_iso={today_iso}
						logged_set={logged_set}
						achieved={achieved_by_habit.get(habit.id) ?? 0}
						onToggle={onToggle}
					/>
				))}
			</div>
		</div>
	);
};

export default HabitGrid;
