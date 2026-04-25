"use client";

/* UTILITIES */
import { buildDateString, getWeekdayLetter } from "@/lib/date-helpers";
import { cn } from "@/lib/utils";

interface Props {
	year: number;
	month_num: number;
	days_count: number;
	today_iso: string | null;
}

/**
 * DOCU: Renders the header row of the habit grid: "Habits" label, weekday letter + day number for each day, "Goal", "Achieved". Today's column is highlighted with a black background. <br>
 * Triggered: As the first row of HabitGrid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const HabitGridHeader = ({ year, month_num, days_count, today_iso }: Props) => {
	const days = Array.from({ length: days_count }, (_, idx) => idx + 1);

	return (
		<div className="contents">
			<div className="sticky left-0 bg-foreground z-20 flex items-center justify-center px-[12] py-[12] border-r border-b border-lines text-primary text-body-md font-bold">
				Habits
			</div>

			{days.map((day) => {
				const date = buildDateString(year, month_num, day);
				const is_today = date === today_iso;
				return (
					<div
						key={date}
						className={cn(
							"flex flex-col items-center justify-center py-[8] border-r border-b border-lines text-body-sm",
							is_today && "bg-black text-white"
						)}
					>
						<span className={cn(!is_today && "text-medium-grey")}>
							{getWeekdayLetter(year, month_num, day)}
						</span>
						<span className="font-bold">
							{day}
						</span>
					</div>
				);
			})}

			<div className="sticky right-[80] bg-foreground z-20 flex items-center justify-center border-l border-r border-b border-lines text-primary text-body-md font-bold">
				Goal
			</div>
			<div className="sticky right-0 bg-foreground z-20 flex items-center justify-center border-b border-lines text-primary text-body-md font-bold">
				Achieved
			</div>
		</div>
	);
};

export default HabitGridHeader;
