# Task Completion Celebration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Play a slight-wiggle + whole-card confetti burst when a user marks an incomplete task done from its board card, then fade the card out as it moves into the collapsed Completed section.

**Architecture:** A locally-controlled ~700ms "celebration window" inside `TaskItem` delays the existing `toggleTaskComplete` mutation so the card stays mounted long enough to animate. Animation is pure CSS (custom keyframes in `globals.css`); confetti particles are a small presentational overlay component. The mutation hook, server action, column filtering, and drag logic are untouched.

**Tech Stack:** Next.js 16 / React 19, TypeScript 5, Tailwind CSS v4 (`@utility`/keyframes in `globals.css`), `tailwindcss-animate` (already loaded), TanStack React Query v5, react-icons.

---

## Conventions (read before starting)

- **Variables:** `snake_case`. **Functions:** `camelCase`. **Types:** `PascalCase`. **Files:** `kebab-case`.
- **Imports:** absolute `@/...`, grouped with labeled comments (`/* REACT */`, `/* COMPONENTS */`, `/* UTILITIES */`, etc.).
- **JSDoc** on every function: `DOCU:` / `Triggered:` / `Last Updated: June 13, 2026` / `@author Jhones`.
- **Tailwind arbitrary values: integers only, no units** — `size-[8]`, `rounded-[2]` (custom `@utility` rules convert to rem; `rounded-[2]` is a native Tailwind arbitrary radius which is fine here).
- **Prettier:** tabs, double quotes, semicolons always.
- **Icons:** react-icons.

## No-Commit Rule

**Do NOT run `git commit` or `git add` for committing.** The user reviews all changes before committing. Each task ends with build/typecheck gates and (for the final task) runtime verification — never a commit. Leave changes in the working tree.

## No Test Framework

This project has no test runner. "Verify" steps run the type checker, the production build, and (final task) the running app. Do not add a test framework or test files.

## File Structure

| File | Responsibility |
|------|----------------|
| `app/globals.css` | Animation keyframes (`slight-wiggle`, `card-fade-out`, `confetti-fly`) + the `.animate-celebrate` / `.confetti-particle` classes + reduced-motion override |
| `components/columns/card-confetti.tsx` | **New.** Presentational overlay: ~10 absolutely-positioned confetti particle spans with per-particle direction/color/shape |
| `components/columns/task-item.tsx` | Celebration state machine: local `is_celebrating`, timeout ref, reduced-motion gate, delayed mutation, render confetti + animation classes |

---

### Task 1: Add celebration keyframes and classes to `globals.css`

**Files:**
- Modify: `app/globals.css` (append to end, after the `.react-colorful` block at line ~193)

- [ ] **Step 1: Append the keyframes and animation classes**

Add this block to the very end of `app/globals.css`:

```css
/* ===== Task completion celebration ===== */

/* Slight playful shake with a tiny scale pop. */
@keyframes slight-wiggle {
	0%, 15% { transform: rotate(0) scale(1); }
	22% { transform: scale(1.04); }
	30% { transform: rotate(-2.2deg); }
	44% { transform: rotate(2.2deg); }
	58% { transform: rotate(-1.4deg); }
	72% { transform: rotate(1.4deg); }
	85%, 100% { transform: rotate(0) scale(1); }
}

/* Card stays fully visible through the wiggle, then fades out at the tail. */
@keyframes card-fade-out {
	0%, 60% { opacity: 1; }
	100% { opacity: 0; }
}

/* A particle erupts outward and fades. Direction/rotation come from per-particle CSS vars. */
@keyframes confetti-fly {
	0% { opacity: 0; transform: translate(0, 0) scale(0.3) rotate(0); }
	15% { opacity: 1; transform: translate(calc(var(--cf-x) * 0.3), calc(var(--cf-y) * 0.3)) scale(1) rotate(calc(var(--cf-r) * 0.3)); }
	100% { opacity: 0; transform: translate(var(--cf-x), var(--cf-y)) scale(0.85) rotate(var(--cf-r)); }
}

/* Applied to the task card root during the ~700ms celebration window.
   Duration here MUST match CELEBRATION_DURATION_MS in task-item.tsx. */
.animate-celebrate {
	animation: slight-wiggle 700ms ease-in-out, card-fade-out 700ms ease-in forwards;
}

.confetti-particle {
	animation: confetti-fly 700ms ease-out forwards;
}

/* Honor reduced-motion: no wiggle, no confetti. */
@media (prefers-reduced-motion: reduce) {
	.animate-celebrate,
	.confetti-particle {
		animation: none !important;
		opacity: 0;
	}
}
```

- [ ] **Step 2: Verify the build picks up the CSS with no errors**

Run: `npx tsc --noEmit`
Expected: exits 0 (CSS change can't break TS; this confirms the workspace still typechecks).

Run: `npm run build`
Expected: build completes successfully ("Compiled successfully" / route table printed), no CSS parse errors.

---

### Task 2: Create the `CardConfetti` overlay component

**Files:**
- Create: `components/columns/card-confetti.tsx`

- [ ] **Step 1: Create the file with the full component**

Create `components/columns/card-confetti.tsx` with exactly this content:

```tsx
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
```

- [ ] **Step 2: Verify it typechecks and builds**

Run: `npx tsc --noEmit`
Expected: exits 0 (the `as CSSProperties` cast lets the `--cf-*` custom props pass type checking).

Run: `npm run build`
Expected: build completes successfully, no errors referencing `card-confetti.tsx`.

Note: the component is not yet rendered anywhere — Task 3 wires it in. Building now confirms it compiles in isolation.

---

### Task 3: Wire the celebration into `TaskItem`

**Files:**
- Modify: `components/columns/task-item.tsx`

Context: `TaskItem` currently calls `toggleTaskComplete(...)` synchronously in `onToggleComplete` (lines 64–72). The optimistic update in `useToggleTaskComplete` flips `task.isCompleted` immediately, which makes `column-item.tsx` re-filter the card out of the incomplete list and unmount it — so there is no time to animate. This task delays the mutation by a local celebration window.

- [ ] **Step 1: Add the duration constant and new imports**

At the top of `components/columns/task-item.tsx`, update the REACT import to include `useEffect`, and add the `CardConfetti` import in the COMPONENTS group. The current REACT import is:

```tsx
/* REACT */
import { useRef, useState } from "react";
```

Change it to:

```tsx
/* REACT */
import { useEffect, useRef, useState } from "react";
```

Add a COMPONENTS import group directly below the REACT import (there is currently no COMPONENTS group in this file):

```tsx
/* COMPONENTS */
import CardConfetti from "@/components/columns/card-confetti";
```

Then, immediately after the import block and before `interface Props`, add the module-level constant:

```tsx
/* Celebration window in ms. MUST match the animation durations in globals.css (.animate-celebrate / .confetti-particle). */
const CELEBRATION_DURATION_MS = 700;
```

- [ ] **Step 2: Add celebration state, cleanup, and reduced-motion helper**

Inside the `TaskItem` component body, directly after the existing `const { toggleTaskComplete, isPending: is_toggling } = useToggleTaskComplete();` line, add:

```tsx
	const [is_celebrating, setIsCelebrating] = useState(false);
	const celebration_timeout_ref = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (celebration_timeout_ref.current) {
				clearTimeout(celebration_timeout_ref.current);
			}
		};
	}, []);
```

- [ ] **Step 3: Replace `onToggleComplete` with the celebration-aware version**

Replace the entire existing `onToggleComplete` function (the JSDoc block + function, currently lines 58–72) with:

```tsx
	/**
	 * DOCU: Toggles the task's completion. Completing an incomplete task plays a confetti + wiggle celebration, then fires the mutation after the celebration window; un-completing (or reduced-motion) toggles immediately. <br>
	 * Triggered: On clicking the checkmark button on the task card. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const onToggleComplete = (event: React.MouseEvent) => {
		event.stopPropagation();

		/* Ignore extra clicks while a celebration is already running. */
		if (is_celebrating) return;

		const next_completed = !task.isCompleted;
		const prefers_reduced_motion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		/* Celebrate only when completing (not un-completing) and motion is allowed. */
		if (next_completed && !prefers_reduced_motion) {
			setIsCelebrating(true);
			celebration_timeout_ref.current = setTimeout(() => {
				toggleTaskComplete({ board_id, column_id, task_id: task.id, isCompleted: true });
				setIsCelebrating(false);
			}, CELEBRATION_DURATION_MS);
			return;
		}

		/* Un-complete, or reduced motion: toggle immediately. */
		toggleTaskComplete({ board_id, column_id, task_id: task.id, isCompleted: next_completed });
	};
```

- [ ] **Step 4: Show the completed checkmark during celebration**

Inside the component, before the `return (`, add a derived flag:

```tsx
	const show_completed = task.isCompleted || is_celebrating;
```

In the JSX, the checkmark button currently keys off `task.isCompleted` in three places (the button's color class, and the icon ternary). Update them to use `show_completed` so the check reads green the instant the user clicks. The current button is:

```tsx
			<button
				type="button"
				className={cn(
					"shrink-0 mr-[12] cursor-pointer transition-colors",
					task.isCompleted ? "text-success" : "text-medium-grey hover:text-success",
					isDragging && "opacity-0",
					is_toggling && "opacity-50 pointer-events-none"
				)}
				onClick={onToggleComplete}
				aria-label={task.isCompleted ? "Mark task as incomplete" : "Mark task as done"}
			>
				{task.isCompleted ? <MdCheckCircle size={22} /> : <MdRadioButtonUnchecked size={22} />}
			</button>
```

Replace it with (only the `task.isCompleted` → `show_completed` swaps on the color class and the icon; the `aria-label` keeps using `task.isCompleted` to reflect true persisted state):

```tsx
			<button
				type="button"
				className={cn(
					"shrink-0 mr-[12] cursor-pointer transition-colors",
					show_completed ? "text-success" : "text-medium-grey hover:text-success",
					isDragging && "opacity-0",
					is_toggling && "opacity-50 pointer-events-none"
				)}
				onClick={onToggleComplete}
				aria-label={task.isCompleted ? "Mark task as incomplete" : "Mark task as done"}
			>
				{show_completed ? <MdCheckCircle size={22} /> : <MdRadioButtonUnchecked size={22} />}
			</button>
```

- [ ] **Step 5: Make the card root positioned, apply the animation class, and render confetti**

The card root `<div>` currently is:

```tsx
		<div key={task.id} ref={setElement} className={cn(
			"bg-foreground rounded-lg flex items-center drop-shadow-md px-[16] py-[24] group transition-opacity",
			isDragging && "border-dashed border-2 border-primary !bg-transparent",
			disabled && "opacity-50 pointer-events-none",
			task.isCompleted && "border border-success/30 bg-success/5"
		)}>
```

Replace it with (adds `relative` so the absolute confetti overlay anchors to the card, and adds the `animate-celebrate` class while celebrating):

```tsx
		<div key={task.id} ref={setElement} className={cn(
			"relative bg-foreground rounded-lg flex items-center drop-shadow-md px-[16] py-[24] group transition-opacity",
			isDragging && "border-dashed border-2 border-primary !bg-transparent",
			disabled && "opacity-50 pointer-events-none",
			task.isCompleted && "border border-success/30 bg-success/5",
			is_celebrating && "animate-celebrate"
		)}>
			{is_celebrating && <CardConfetti />}
```

(The `{is_celebrating && <CardConfetti />}` line is added as the first child inside the card root, immediately after the opening `<div ...>`.)

- [ ] **Step 6: Verify typecheck and build**

Run: `npx tsc --noEmit`
Expected: exits 0.

Run: `npm run build`
Expected: build completes successfully, no errors.

---

### Task 4: Runtime verification (run the app)

**Files:** none (verification only)

This is the real proof the feature works. No code changes.

- [ ] **Step 1: Start (or reuse) the dev server**

Run: `npm run dev`
Expected: server boots on http://localhost:3000 (or reuse an already-running instance). If port 3000 is busy with the project's own dev server, use that one.

- [ ] **Step 2: Verify the completion celebration**

Open a board with at least one incomplete task. Click an incomplete task's checkmark.
Expected: the checkmark turns green, the card does a slight wiggle, confetti bursts across the whole card, the card fades out (~700ms), then it's gone from the incomplete list (count in the column header drops by one). Expanding the Completed section shows the task there.

- [ ] **Step 3: Verify no celebration on un-complete**

Expand the Completed section and click a completed task's green checkmark.
Expected: it toggles back to incomplete immediately — no wiggle, no confetti — and reappears in the incomplete list.

- [ ] **Step 4: Verify reduced-motion**

Enable the OS "Reduce motion" setting (macOS: System Settings → Accessibility → Display → Reduce motion), reload the board, and complete a task.
Expected: the task completes instantly with no wiggle and no confetti.

- [ ] **Step 5: Verify rapid-click safety**

Rapidly click an incomplete task's checkmark several times during the celebration.
Expected: only one completion is registered (one success toast), no console errors, no duplicated confetti, no orphaned timeout warning.

- [ ] **Step 6: Capture evidence**

Take a screenshot mid-celebration (confetti + wiggle visible) and confirm the final state (task in Completed section). Note any visual rough edges (timing, particle spread, fade smoothness) for follow-up.

---

## Self-Review

**Spec coverage:**
- Slight wiggle + whole-card confetti on completing → Task 1 (keyframes) + Task 2 (confetti) + Task 3 (wiring). ✓
- Confetti spread across the whole card (origins 12%–88%) → `PARTICLES` `origin_x` values in Task 2 match the approved preview. ✓
- Fade out then move to Completed section → `card-fade-out` keyframe (Task 1) + delayed mutation (Task 3 Step 3). ✓
- ~700ms duration, single source of truth → `CELEBRATION_DURATION_MS` (Task 3 Step 1) + matching CSS durations (Task 1), cross-noted in comments. ✓
- No celebration on un-complete → `next_completed && !prefers_reduced_motion` guard (Task 3 Step 3). ✓
- `prefers-reduced-motion` respected → JS guard (Task 3) + CSS `@media` override (Task 1). ✓
- Double-click guarded → `if (is_celebrating) return;` (Task 3 Step 3). ✓
- Timeout cleared on unmount → `useEffect` cleanup (Task 3 Step 2). ✓
- Checkmark reads completed immediately → `show_completed` (Task 3 Step 4). ✓
- Mutation hook / server action / column logic untouched → only `globals.css`, `card-confetti.tsx`, `task-item.tsx` change. ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code. ✓

**Type consistency:** `CELEBRATION_DURATION_MS` (constant), `is_celebrating`/`setIsCelebrating`, `celebration_timeout_ref`, `show_completed`, `CardConfetti` default export, `ConfettiParticle` fields (`origin_x`, `x`, `y`, `rotate`, `color`, `is_round`) and the `--cf-x`/`--cf-y`/`--cf-r` vars consumed by the `confetti-fly` keyframe — all names match across tasks. ✓
