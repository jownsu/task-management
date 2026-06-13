"use client";

/* REACT */
import { useEffect, useRef, useState } from "react";

/* COMPONENTS */
import ChipConfetti from "@/components/habit-tracker/chip-confetti";

/* UTILITIES */
import { cn } from "@/lib/utils";
import { getContrastColor } from "@/lib/helpers";

/* Duration of the day-chip celebration. Must outlast the longest animation
   below (the confetti-fly burst, 700ms — see globals.css). */
const CELEBRATION_DURATION_MS = 700;

interface Props {
	day: number;
	is_logged: boolean;
	is_today: boolean;
	theme: string;
	is_disabled: boolean;
	onClick: () => void;
}

/**
 * DOCU: Single numbered day chip used in the habit card. Filled with the habit's theme color when logged; today's chip is outlined. Disabled while its card has an in-flight toggle. Plays a scale-pop + confetti burst when a day is marked done (not when un-marking, and not under reduced-motion). <br>
 * Triggered: For every day of the month inside HabitCard. <br>
 * Last Updated: June 13, 2026
 * @author Jhones
 */
const HabitDayChip = ({ day, is_logged, is_today, theme, is_disabled, onClick }: Props) => {
	const [is_celebrating, setIsCelebrating] = useState(false);
	const celebration_timeout_ref = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (celebration_timeout_ref.current) {
				clearTimeout(celebration_timeout_ref.current);
			}
		};
	}, []);

	/**
	 * DOCU: Toggles the day and, when marking it done, plays a brief celebration. The toggle itself fires immediately (the fill is optimistic) — the animation only plays on top. <br>
	 * Triggered: When the user clicks the day chip. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const handleClick = () => {
		const is_marking_done = !is_logged;
		const prefers_reduced_motion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		/* Celebrate only when completing a day (not un-marking) and motion is allowed. */
		if (is_marking_done && !prefers_reduced_motion) {
			setIsCelebrating(true);
			if (celebration_timeout_ref.current) {
				clearTimeout(celebration_timeout_ref.current);
			}
			celebration_timeout_ref.current = setTimeout(() => {
				setIsCelebrating(false);
				celebration_timeout_ref.current = null;
			}, CELEBRATION_DURATION_MS);
		}

		onClick();
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={is_disabled}
			className={cn(
				"relative size-[34] flex items-center justify-center rounded-md border border-lines text-body-sm cursor-pointer transition-colors disabled:cursor-not-allowed",
				is_today && !is_logged && "border-primary text-primary font-bold",
				!is_logged && "hover:bg-primary/10",
				is_celebrating && "animate-habit-pop z-10"
			)}
			style={{
				backgroundColor: is_logged ? theme : undefined,
				color: is_logged ? getContrastColor(theme) : undefined
			}}
			aria-label={is_logged ? `Day ${day}, mark as not done` : `Day ${day}, mark as done`}
			aria-pressed={is_logged}
		>
			{is_celebrating && <ChipConfetti />}
			{day}
		</button>
	);
};

export default HabitDayChip;
