# Move Task Creation Into Columns — Design

**Date:** 2026-06-13
**Author:** Jhones

## Goal

Move the global "Add New Task" action out of the navbar and into each column, so task creation is contextual to the column the user is working in. Each column keeps its instant title-only quick-add and gains a one-click escalation to the full task modal, pre-scoped to that column.

## Background

Today there are two task-creation entry points:

1. **Navbar button** (`task-management-nav-actions.tsx`) — opens the full create-task modal (title, description, subtasks, tags, column picker). The column always defaults to the **first** column.
2. **Per-column inline quick-add** (`quick-add-task.tsx`) — a title-only input at the bottom of every column; Enter or the `+` button creates the task instantly in that column.

The navbar button is disconnected from the column the user is actually looking at, and duplicates a capability that already lives (in lighter form) in each column. This redesign removes the navbar button and folds its capability into the column quick-add as an escalation affordance.

## Behavior

Each column's quick-add row gains an always-visible **expand icon** between the input and the `+` button:

```
[ + Add New Task .......... ] (⤢) (+)
```

- **Inline quick-add (unchanged):** typing a title and pressing Enter or clicking `+` creates a title-only task in that column instantly.
- **Expand icon (new):** clicking it opens the **existing** full create-task modal, with:
  - the **column pre-selected** to that column, and
  - whatever was typed in the inline input **carried in as the starting title**.
  - The inline input is **cleared** on escalation — the draft is "promoted" into the modal, leaving no stale text behind.

The modal itself is unchanged in look and behavior: title, description, tags, subtasks, a column `<Select>` (still editable — pre-select is only a default), and Create/Cancel.

**No celebration, no new mutation** — this only changes how task creation is *triggered* and *pre-filled*, not how tasks are created.

## Architecture

### `components/navigation/task-management-nav-actions.tsx`

- Remove the `<Button>` "Add New Task" and its `FaPlus` icon and `setTaskModal` usage.
- Keep the `ActionOptions` board dropdown (edit / delete / edit tags) exactly as is.
- The navbar continues to render this component (board name + dropdown) when the active board is `TASK_MANAGEMENT`. The `HABIT_TRACKER` nav actions are **untouched**.

### `store/task.store.ts`

Add dedicated state + an action for opening the add-task modal scoped to a column, kept separate from the existing `selected_task_id` / `selected_column_id` (which serve view/edit):

- `add_task_column_id: string | null`
- `add_task_initial_title: string`
- `openAddTask: (column_id: string, initial_title: string) => void` — sets `add_task_column_id`, `add_task_initial_title`, and `modals.add_task = true` in one call.

When the modal closes (`setModal("add_task", false)`), `add_task_column_id` resets to `null` and `add_task_initial_title` to `""` so a later open via any path starts clean. This reset happens in the modal's existing close handling (see below) rather than inside `setModal`, to keep `setModal` generic.

### `components/columns/quick-add-task.tsx`

- Read `openAddTask` from the task store.
- Add an expand icon button (`MdOpenInFull` from `react-icons/md`) between the input and the existing `+` button. Always visible.
- On click: call `openAddTask(column_id, title.trim())`, then clear the local `title` state.
- The button is `type="button"`, has an `aria-label` (e.g. "Add task with details"), and is **not** disabled by empty input (an empty title is valid — it just opens a blank modal for that column).

### `components/task/create-task-modal.tsx`

- Read `add_task_column_id` and `add_task_initial_title` from the store.
- In the existing open-reset `useEffect` (keyed on `modals.add_task`), change the reset defaults:
  - `column_id: add_task_column_id ?? board?.columns?.[0]?.id ?? ""`
  - `title: add_task_initial_title`
  - (description, sub_tasks, tag_ids defaults unchanged)
- On modal close, reset `add_task_column_id` to `null` and `add_task_initial_title` to `""`. The modal already controls close via `onOpenChange` and the Cancel button + `onSuccess`; route those through a small handler that also clears the store fields (or call a store reset). Keep it DRY — one close path that both flips `modals.add_task` off and clears the two add-task fields.

## Data Flow

1. User clicks the expand icon on column X's quick-add → `openAddTask(X.id, typedTitle)`.
2. Store sets `add_task_column_id = X.id`, `add_task_initial_title = typedTitle`, `modals.add_task = true`. Quick-add input clears.
3. Modal's open-reset effect fires → form initializes with `column_id = X.id`, `title = typedTitle`.
4. User edits/submits → existing `useCreateTask` runs unchanged → on success the modal closes and the add-task store fields reset.
5. Cancel / outside-click → modal closes, add-task store fields reset, nothing created.

The inline `+` / Enter path is completely independent and unchanged.

## Error Handling

- Pre-selected column is only a **default**; the `<Select>` remains editable, so a stale/invalid `add_task_column_id` still falls back to a valid column the user can change. Boards with zero columns behave as today (empty string default).
- Carried title is trimmed before being passed; empty is acceptable (opens a blank modal).
- No new network calls or mutations are introduced, so no new failure modes. The existing `useCreateTask` error handling is unchanged.

## Testing / Verification

No test framework exists; verify by running the app (consistent with prior features):

- Navbar no longer shows "Add New Task"; the board dropdown still works.
- Each column shows the expand icon on its quick-add row.
- Clicking expand with text typed → modal opens with that column pre-selected and the title pre-filled; the inline input is cleared.
- Clicking expand with no text → modal opens blank with that column pre-selected.
- Clicking expand on a *different* column pre-selects *that* column.
- Inline Enter / `+` still creates a title-only task instantly in the right column.
- Cancel/close then reopen via a different column → no stale title or column carried over.
- `npx tsc --noEmit` and `npm run build` pass (gates, not the verification itself).

## Files Changed

| File | Change |
|------|--------|
| `components/navigation/task-management-nav-actions.tsx` | Remove the "Add New Task" button (+ its icon/store usage); keep the board `ActionOptions` dropdown |
| `store/task.store.ts` | Add `add_task_column_id`, `add_task_initial_title`, and `openAddTask(column_id, initial_title)`; reset fields on modal close |
| `components/columns/quick-add-task.tsx` | Add always-visible expand icon button that calls `openAddTask(column_id, title.trim())` and clears the input |
| `components/task/create-task-modal.tsx` | Default the form's `column_id` and `title` from the store fields on open; clear those fields on close |

## Out of Scope (YAGNI)

- No change to the create-task mutation, server action, or Zod schema.
- No change to the habit-tracker board or its nav actions.
- No multi-task creation, templates, or duplicating tasks.
- No change to the completion-celebration feature.
- No restyling of the modal itself.
