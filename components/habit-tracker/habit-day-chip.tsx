"use client";

/* UTILITIES */
import { cn } from "@/lib/utils";
import { getContrastColor } from "@/lib/helpers";

interface Props {
	day: number;
	is_logged: boolean;
	is_today: boolean;
	theme: string;
	is_disabled: boolean;
	onClick: () => void;
}

/**
 * DOCU: Single numbered day chip used in the habit card. Filled with the habit's theme color when logged; today's chip is outlined. Disabled while its card has an in-flight toggle. <br>
 * Triggered: For every day of the month inside HabitCard. <br>
 * Last Updated: May 30, 2026
 * @author Jhones
 */
const HabitDayChip = ({ day, is_logged, is_today, theme, is_disabled, onClick }: Props) => {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={is_disabled}
			className={cn(
				"size-[34] flex items-center justify-center rounded-md border border-lines text-body-sm cursor-pointer transition-colors disabled:cursor-not-allowed",
				is_today && !is_logged && "border-primary text-primary font-bold",
				!is_logged && "hover:bg-primary/10"
			)}
			style={{
				backgroundColor: is_logged ? theme : undefined,
				color: is_logged ? getContrastColor(theme) : undefined
			}}
			aria-label={is_logged ? `Day ${day}, mark as not done` : `Day ${day}, mark as done`}
			aria-pressed={is_logged}
		>
			{day}
		</button>
	);
};

export default HabitDayChip;
