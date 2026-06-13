"use client";

/* REACT */
import { useEffect, useRef, useState } from "react";

/* COMPONENTS */
import HabitCard from "@/components/habit-tracker/habit-card";
import CreateHabitItem from "@/components/habit-tracker/create-habit-item";

/* PLUGINS */
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

/* MUTATIONS */
import { useReorderHabit } from "@/hooks/mutations/habit.mutation";

/* TYPES */
import { Habit, HabitLog } from "@/types";

interface Props {
	board_id: string;
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
 * DOCU: Habit-tracker view. Renders one sortable calendar HabitCard per habit in a responsive grid (1 column on mobile, auto-filling multiple columns on wider screens). Cards can be drag-reordered via their handle; the new order is optimistically applied and persisted to the board's habitOrder. <br>
 * Triggered: From the habit-tracker board orchestrator when habits and logs are available. <br>
 * Last Updated: May 30, 2026
 * @author Jhones
 */
const HabitGrid = ({ board_id, habits, logs, year, month_num, days_count, today_iso, toggling_habit_ids, onToggle }: Props) => {
	const { reorderHabit, isPending: is_reordering } = useReorderHabit(board_id);

	const [ordered_habits, setOrderedHabits] = useState<Habit[]>(habits);
	const snapshot_ref = useRef<Habit[]>([]);

	useEffect(() => {
		setOrderedHabits(habits);
	}, [habits]);

	const logged_set = new Set(logs.map((log) => `${log.habitId}-${log.date}`));
	const achieved_by_habit = new Map<string, number>();
	for (const log of logs) {
		achieved_by_habit.set(log.habitId, (achieved_by_habit.get(log.habitId) ?? 0) + 1);
	}

	/**
	 * DOCU: Snapshots the current habit order before dragging starts for rollback on cancel. <br>
	 * Triggered: When a habit card starts being dragged. <br>
	 * Last Updated: May 30, 2026
	 * @author Jhones
	 */
	const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
		snapshot_ref.current = ordered_habits;
	};

	/**
	 * DOCU: Optimistically reorders the habit cards as one is dragged over another. <br>
	 * Triggered: When a dragged habit card hovers over another card. <br>
	 * Last Updated: May 30, 2026
	 * @author Jhones
	 */
	const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = (event) => {
		setOrderedHabits((prev) => move(prev, event));
	};

	/**
	 * DOCU: Persists the new habit order on drop, or reverts on cancel / no-op reorders. <br>
	 * Triggered: When a dragged habit card is dropped. <br>
	 * Last Updated: May 30, 2026
	 * @author Jhones
	 */
	const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = (event) => {
		if (event.canceled) {
			setOrderedHabits(snapshot_ref.current);
			return;
		}

		const updated_habit_order = ordered_habits.map((habit) => habit.id);
		const snapshot_order = snapshot_ref.current.map((habit) => habit.id);

		if (JSON.stringify(snapshot_order) === JSON.stringify(updated_habit_order)) {
			return;
		}

		reorderHabit({ board_id, updated_habit_order });
	};

	return (
		<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[16]">
				{ordered_habits.map((habit, index) => (
					<HabitCard
						key={habit.id}
						habit={habit}
						index={index}
						year={year}
						month_num={month_num}
						days_count={days_count}
						today_iso={today_iso}
						logged_set={logged_set}
						achieved={achieved_by_habit.get(habit.id) ?? 0}
						is_disabled={toggling_habit_ids.has(habit.id)}
						is_reordering={is_reordering}
						onToggle={onToggle}
					/>
				))}
				<CreateHabitItem />
			</div>

			<DragOverlay dropAnimation={null}>
				{(source) => {
					const habit = ordered_habits.find((item) => item.id === source.id);
					if (!habit) return null;

					return (
						<HabitCard
							habit={{ ...habit, id: "0" }}
							index={0}
							year={year}
							month_num={month_num}
							days_count={days_count}
							today_iso={today_iso}
							logged_set={logged_set}
							achieved={achieved_by_habit.get(habit.id) ?? 0}
							is_disabled={false}
							is_reordering={false}
							onToggle={onToggle}
						/>
					);
				}}
			</DragOverlay>
		</DragDropProvider>
	);
};

export default HabitGrid;
