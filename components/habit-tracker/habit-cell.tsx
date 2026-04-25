"use client";

/* ICONS */
import { FaCheck } from "react-icons/fa6";

/* UTILITIES */
import { cn } from "@/lib/utils";
import { getContrastColor } from "@/lib/helpers";

interface Props {
	is_logged: boolean;
	is_today: boolean;
	theme: string;
	onClick: () => void;
}

/**
 * DOCU: Single day cell in the habit tracker grid. Shows a check when logged; filled with the habit's theme color when logged. <br>
 * Triggered: For every (habit, day) pair in the visible month. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const HabitCell = ({ is_logged, is_today, theme, onClick }: Props) => {
	const background = is_logged ? theme : undefined;
	const hover_background = !is_logged ? `${theme}40` : undefined;
	const check_color = is_logged ? getContrastColor(theme) : undefined;

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"aspect-square w-full min-w-[32] flex items-center justify-center cursor-pointer border-r border-b border-lines transition-colors",
				is_today && !is_logged && "bg-foreground"
			)}
			style={{
				backgroundColor: background
			}}
			onMouseEnter={(e) => {
				if (hover_background) e.currentTarget.style.backgroundColor = hover_background;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = background ?? "";
			}}
			aria-label={is_logged ? "Mark as not done" : "Mark as done"}
		>
			{is_logged && (
				<FaCheck
					className="size-[12]"
					style={{ color: check_color }}
				/>
			)}
		</button>
	);
};

export default HabitCell;
