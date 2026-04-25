"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* COMPONENTS */
import EditHabitBoardModal from "@/components/board/edit-habit-board-modal";
import DeleteBoardModal from "@/components/board/delete-board-modal";
import AddHabitModal from "@/components/habit-tracker/add-habit-modal";
import EditHabitModal from "@/components/habit-tracker/edit-habit-modal";
import MonthPicker from "@/components/habit-tracker/month-picker";
import HabitGrid from "@/components/habit-tracker/habit-grid";

/* PLUGINS */
import { parseAsString, useQueryState } from "nuqs";

/* QUERIES */
import { useGetHabitTrackerBoard } from "@/hooks/queries/habit-tracker-board.query";
import { useGetHabitLogs } from "@/hooks/queries/habit.query";

/* MUTATIONS */
import { useToggleHabitLog } from "@/hooks/mutations/habit.mutation";

/* UTILITIES */
import { currentYearMonth, daysInMonth, formatLocalDate, parseYearMonth } from "@/lib/date-helpers";

/**
 * DOCU: Habit-tracker board orchestrator. Reads month from URL (nuqs), fetches habits + logs, renders MonthPicker, HabitGrid, and modals. <br>
 * Triggered: On the habit-tracker board detail page. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const HabitTrackerBoard = () => {
	const { board_id } = useParams() as { board_id: string };
	const [year_month, setYearMonth] = useQueryState("month", parseAsString.withDefault(currentYearMonth()));
	const { year, month_num } = parseYearMonth(year_month);
	const days_count = daysInMonth(year, month_num);
	const today_iso = formatLocalDate(new Date());

	const { board } = useGetHabitTrackerBoard(board_id);
	const { logs } = useGetHabitLogs(board_id, year, month_num);
	const { toggleHabitLog } = useToggleHabitLog(board_id, year, month_num);

	const habits = board?.habits ?? [];

	const handleToggle = (habit_id: string, date: string) => {
		toggleHabitLog({ habit_id, date });
	};

	return (
		<div className="p-[24] flex flex-col gap-[16]">
			<MonthPicker year_month={year_month} onChange={setYearMonth} />

			<HabitGrid
				habits={habits}
				logs={logs}
				year={year}
				month_num={month_num}
				days_count={days_count}
				today_iso={today_iso}
				onToggle={handleToggle}
			/>

			{/* MODALS */}
			<EditHabitBoardModal />
			<DeleteBoardModal />
			<AddHabitModal />
			<EditHabitModal />
		</div>
	);
};

export default HabitTrackerBoard;
