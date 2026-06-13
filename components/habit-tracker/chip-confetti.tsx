/* REACT */
import { CSSProperties } from "react";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface ConfettiParticle {
	/** Horizontal travel distance in px (signed). */
	x: number;
	/** Vertical travel distance in px (signed; negative = upward). */
	y: number;
	/** Rotation in degrees during flight. */
	rotate: number;
	color: string;
	is_round: boolean;
}

/* Eight particles bursting radially from the chip's center. Travel distances are
   small to suit the 34px chip. Colors use the board's accent palette. */
const PARTICLES: ConfettiParticle[] = [
	{ x: 0, y: -24, rotate: 160, color: "#635fc7", is_round: false },
	{ x: 18, y: -18, rotate: -140, color: "#21bf73", is_round: true },
	{ x: 24, y: 0, rotate: 180, color: "#f5b700", is_round: false },
	{ x: 18, y: 18, rotate: -160, color: "#49c4e5", is_round: true },
	{ x: 0, y: 24, rotate: 140, color: "#ea5555", is_round: false },
	{ x: -18, y: 18, rotate: -180, color: "#635fc7", is_round: true },
	{ x: -24, y: 0, rotate: 120, color: "#21bf73", is_round: false },
	{ x: -18, y: -18, rotate: -120, color: "#f5b700", is_round: true }
];

/**
 * DOCU: Renders a small non-interactive confetti burst centered on a habit day chip. Each particle flies outward from the chip center using per-particle CSS custom properties consumed by the shared `confetti-fly` keyframe. <br>
 * Triggered: Rendered inside HabitDayChip only while a day-completion celebration is active. <br>
 * Last Updated: June 13, 2026
 * @author Jhones
 */
const ChipConfetti = () => {
	return (
		<span className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
			{PARTICLES.map((particle, index) => (
				<span
					key={index}
					className={cn("confetti-particle absolute top-1/2 left-1/2 block size-[5]", particle.is_round ? "rounded-full" : "rounded-[1]")}
					style={
						{
							backgroundColor: particle.color,
							"--cf-x": `${particle.x}px`,
							"--cf-y": `${particle.y}px`,
							"--cf-r": `${particle.rotate}deg`
						} as CSSProperties
					}
				/>
			))}
		</span>
	);
};

export default ChipConfetti;
