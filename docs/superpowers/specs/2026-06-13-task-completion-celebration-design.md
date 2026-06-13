# Task Completion Celebration — Confetti + Wiggle Design

**Date:** 2026-06-13
**Author:** Jhones

## Goal

Make completing a task feel rewarding. When a user marks an incomplete task as done from its board card, the card plays a brief celebration — a **slight wiggle** plus a **confetti burst across the whole card** — then fades out as it moves into the collapsed Completed section.

## Behavior

When the user clicks the checkmark on an **incomplete** task card:

1. The checkmark immediately reads as completed (green filled check).
2. The card does a **slight wiggle** — a gentle side-to-side shake with a tiny scale pop.
3. **Confetti bursts** from across the whole card: ~10 small colored particles (mix of squares and circles) fly outward in all directions and fade.
4. The card **fades out** as the celebration finishes.
5. After the celebration window (~700ms), the completion is persisted, and the (already-faded) card is removed from the incomplete list — moved into the collapsed Completed section with no visible pop.

**No celebration on un-complete.** Clicking the green check of an already-completed task (in the expanded Completed section) toggles it back to incomplete **immediately**, with no animation.

**Total duration:** ~700ms.

## Why a local celebration window

Completing a task today flips `task.isCompleted` via the optimistic update in `useToggleTaskComplete`. That immediately re-filters the card out of `incomplete_tasks` in `column-item.tsx` and unmounts it — leaving no time to animate.

The fix is to delay firing the mutation by the celebration duration, controlled by local state inside `TaskItem`:

- Clicking complete sets a local `is_celebrating` flag instead of calling `toggleTaskComplete` right away.
- While `is_celebrating` is true, the card renders the completed (green) check, applies the wiggle keyframe, renders the confetti layer, and fades out near the end — all via CSS.
- After ~700ms (a `setTimeout`, cleared on unmount), `TaskItem` fires `toggleTaskComplete(...)` exactly as today. The optimistic update removes the already-faded card cleanly.

This keeps the change contained: the mutation hook, server action, `column-list.tsx` drag logic, and `column-item.tsx` filtering are all **unchanged**.

## Architecture

### `components/columns/task-item.tsx`

- Add local state: `const [is_celebrating, setIsCelebrating] = useState(false)`.
- Rework `onToggleComplete`:
  - If the task is currently **incomplete** (i.e. we are completing it) **and** motion is allowed: set `is_celebrating = true`, then after the celebration duration fire the existing `toggleTaskComplete(...)` call.
  - If the task is currently **completed** (we are un-completing it), or the user prefers reduced motion: fire `toggleTaskComplete(...)` immediately as today (no celebration).
  - Guard against double-fire: ignore the click if `is_celebrating` is already true.
- Use a ref-held timeout so it can be cleared on unmount (avoid setting state / firing the mutation after the component is gone).
- When `is_celebrating`, the card root gets the wiggle + fade keyframe classes; the check renders as completed (green); and a confetti layer (`<CardConfetti />` or inline spans) is rendered as an absolutely-positioned overlay inside the card.
- Reduced motion: read via a small helper (e.g. `window.matchMedia("(prefers-reduced-motion: reduce)")`). When reduced motion is preferred, skip all animation and complete immediately.

### `components/columns/card-confetti.tsx` (new, optional split)

A small presentational component rendering the ~10 confetti particle spans as an absolutely-positioned overlay (`inset-0`, `pointer-events-none`). Each particle is a span with a per-particle direction. Kept as its own file to keep `task-item.tsx` focused. If it proves trivial, the spans may instead live inline in `task-item.tsx` — either is acceptable, but a dedicated file is preferred for clarity.

Particles use the board's existing accent palette (primary `#635fc7`, success `#21bf73`, plus red/yellow/cyan accents) and a mix of square (`rounded-[2]`) and circular (`rounded-full`) shapes.

### `app/globals.css`

Add custom keyframes + utility classes (Tailwind v4 `@theme`/`@utility` style, consistent with the existing file):

- `slight-wiggle` — small rotation (±~2deg) with a brief scale pop, ~700ms.
- `card-fade-out` — opacity 1 → 0 over the tail of the celebration so the card is invisible before unmount.
- `confetti-fly` — particle travel outward + fade, driven by per-particle CSS custom properties (`--x`, `--y`, `--r`) for direction/rotation so a single keyframe serves all particles.

These follow the existing convention in `globals.css` (the file already loads `tailwindcss-animate` and defines custom `@utility` rules). Animation timing values live here, not hard-coded magic numbers scattered in the component — the ~700ms duration in the component must match the CSS duration; define it as a single named constant in the component and keep the CSS durations in sync.

## Data Flow

Unchanged from today, only delayed:

1. User clicks checkmark → `TaskItem.onToggleComplete`.
2. (Completing path) `is_celebrating = true` → CSS animations play; confetti renders.
3. After ~700ms → `toggleTaskComplete({ board_id, column_id, task_id, isCompleted: true })`.
4. `useToggleTaskComplete` optimistic update flips `isCompleted` in the React Query cache (as today).
5. `column-item.tsx` re-filters: the card leaves `incomplete_tasks`, entering `completed_tasks` (collapsed Completed section).

The un-complete path skips steps 2–3 and calls the mutation directly.

## Error Handling

- The mutation's existing `onError` rollback (restoring `previous_board`) is unchanged. If the server rejects the toggle after the celebration, the card reappears in the incomplete list via the existing rollback — acceptable and consistent with current behavior.
- The celebration timeout is stored in a ref and cleared on unmount to prevent state updates on an unmounted component.
- Double-click / rapid clicks during the celebration window are ignored (the `is_celebrating` guard), so the mutation fires once.

## Testing / Verification

No test framework exists in this project; verification is by running the app (consistent with prior features):

- Mark an incomplete task done → observe wiggle + whole-card confetti, card fades, then moves to the collapsed Completed section.
- Expand the Completed section, un-complete a task → toggles back immediately with **no** animation.
- Enable OS "reduce motion" → completing a task skips the animation and completes instantly.
- Rapidly click the checkmark → only one completion fires; no console errors; no orphaned timeout.
- Confirm `npx tsc --noEmit` and `npm run build` pass (gates, not the verification itself).

## Files Changed

| File | Change |
|------|--------|
| `components/columns/task-item.tsx` | Add `is_celebrating` local state + timeout ref; gate celebration on completing-path and `prefers-reduced-motion`; render confetti overlay + wiggle/fade classes during celebration; delay mutation by celebration duration |
| `components/columns/card-confetti.tsx` | **Create** — presentational confetti particle overlay (~10 spans, board accent colors, per-particle direction) |
| `app/globals.css` | Add `slight-wiggle`, `card-fade-out`, `confetti-fly` keyframes + utility classes |

## Out of Scope (YAGNI)

- No celebration when completing via the view-task modal or "mark all subtasks done" — only the board card's checkmark is the interaction point.
- No confetti library (canvas-confetti, etc.) — pure CSS keeps the bundle and complexity small.
- No sound, haptics, or configurable intensity.
- No celebration on un-complete.
- No server-side, schema, or mutation-hook changes.
