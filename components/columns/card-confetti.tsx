/* REACT */
import { CSSProperties } from "react";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface ConfettiParticle {
	/** Origin position across the card width, as a left percentage. */
	origin_x: number;
	/** Horizontal travel distance in px (signed). */
	x: number;
	/** Vertical travel distance in px (signed; negative = upward). */
	y: number;
	/** Rotation in degrees during flight. */
	rotate: number;
	color: string;
	is_round: boolean;
}

/* Ten particles spread across the whole card, each flying in a distinct direction.
   Colors use the board's accent palette (primary, success, red, yellow, cyan). */
const PARTICLES: ConfettiParticle[] = [
	{ origin_x: 12, x: -60, y: -50, rotate: 200, color: "#635fc7", is_round: false },
	{ origin_x: 30, x: -30, y: -64, rotate: -160, color: "#21bf73", is_round: true },
	{ origin_x: 50, x: 0, y: -72, rotate: 140, color: "#ea5555", is_round: false },
	{ origin_x: 70, x: 34, y: -60, rotate: -200, color: "#f5b700", is_round: true },
	{ origin_x: 88, x: 64, y: -46, rotate: 180, color: "#49c4e5", is_round: false },
	{ origin_x: 18, x: -70, y: 10, rotate: -140, color: "#21bf73", is_round: true },
	{ origin_x: 82, x: 72, y: 14, rotate: 160, color: "#635fc7", is_round: false },
	{ origin_x: 38, x: -24, y: 46, rotate: -180, color: "#f5b700", is_round: true },
	{ origin_x: 62, x: 30, y: 50, rotate: 120, color: "#49c4e5", is_round: false },
	{ origin_x: 50, x: -6, y: 64, rotate: -120, color: "#ea5555", is_round: true }
];

/**
 * DOCU: Renders a non-interactive confetti burst overlay across a task card. Each particle flies outward from a point along the card width using per-particle CSS custom properties consumed by the `confetti-fly` keyframe. <br>
 * Triggered: Rendered inside TaskItem only while a task-completion celebration is active. <br>
 * Last Updated: June 13, 2026
 * @author Jhones
 */
const CardConfetti = () => {
	return (
		<div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
			{PARTICLES.map((particle, index) => (
				<span
					key={index}
					className={cn("confetti-particle absolute top-1/2 block size-[8]", particle.is_round ? "rounded-full" : "rounded-[2]")}
					style={
						{
							left: `${particle.origin_x}%`,
							backgroundColor: particle.color,
							"--cf-x": `${particle.x}px`,
							"--cf-y": `${particle.y}px`,
							"--cf-r": `${particle.rotate}deg`
						} as CSSProperties
					}
				/>
			))}
		</div>
	);
};

export default CardConfetti;
