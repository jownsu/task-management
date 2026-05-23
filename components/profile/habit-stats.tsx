"use client";

/* QUERIES */
import { useGetUserProfile } from "@/hooks/queries/user.query";

/* ICONS */
import { LuFlame, LuActivity, LuTrophy, LuTarget } from "react-icons/lu";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * DOCU: Renders the habit activity section on the profile page — streak stats and 7-day bar chart. <br>
 * Triggered: Rendered inside ProfileContent below the task statistics grid. <br>
 * Last Updated: May 23, 2026
 * @author Jhones
 */
const HabitStats = () => {
	const { user_profile } = useGetUserProfile();

	if (!user_profile) return null;

	const { total_habits, current_streak, longest_streak, total_completions, weekly_activity } = user_profile.habit_stats;

	const stats = [
		{ label: "Total Habits", value: total_habits, icon: LuActivity, color: "text-primary" },
		{ label: "Current Streak", value: `${current_streak}d`, icon: LuFlame, color: "text-orange-500" },
		{ label: "Longest Streak", value: `${longest_streak}d`, icon: LuTrophy, color: "text-amber-500" },
		{ label: "Completions", value: total_completions, icon: LuTarget, color: "text-emerald-500" },
	];

	const max_count = Math.max(...weekly_activity.map((d) => d.count), 1);

	return (
		<div className="mb-[24]">
			<div className="mb-[12] flex items-center gap-[8]">
				<LuFlame size={16} className="text-medium-grey" />
				<span className="!text-b-sm font-semibold uppercase tracking-wider text-medium-grey">Habit Activity</span>
			</div>

			{/* Stat cards */}
			<div className="grid grid-cols-2 gap-[12] md:grid-cols-4 mb-[12]">
				{stats.map(({ label, value, icon: Icon, color }) => (
					<div key={label} className="rounded-lg border border-lines bg-foreground p-[16] text-center">
						<Icon size={18} className={`${color} mx-auto mb-[4]`} />
						<div className={`!text-h-xl font-bold ${color}`}>{value}</div>
						<div className="!text-b-sm text-medium-grey">{label}</div>
					</div>
				))}
			</div>

			{/* 7-day activity bars */}
			<div className="rounded-lg border border-lines bg-foreground p-[16]">
				<p className="!text-b-sm mb-[12] text-medium-grey">Last 7 Days</p>
				<div className="flex gap-[8]" style={{ height: "72px" }}>
					{weekly_activity.map(({ date, count }) => {
						const day_label = DAY_LABELS[new Date(date + "T00:00:00").getDay()];
						const bar_pct = count === 0 ? 0 : (count / max_count) * 100;

						return (
							<div key={date} className="flex flex-1 flex-col items-center gap-[6]">
								<div className="relative w-full flex-1 overflow-hidden rounded-sm bg-primary/10 flex items-end">
									<div
										className="w-full rounded-sm bg-primary transition-all duration-500"
										style={{ height: count === 0 ? "3px" : `${bar_pct}%` }}
									/>
								</div>
								<span className="!text-b-sm leading-none text-medium-grey shrink-0">{day_label}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default HabitStats;
