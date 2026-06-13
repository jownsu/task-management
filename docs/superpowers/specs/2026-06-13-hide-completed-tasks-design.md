# Hide Completed Tasks — Collapsible Completed Section Design

**Date:** 2026-06-13
**Author:** Jhones

## Goal

Reduce clutter on long-lived task boards where completed tasks accumulate and bury the actionable ones. Instead of mixing completed tasks into each column, group them into a per-column **collapsible "Completed" section** that is **hidden (collapsed) by default**.

This replaces the existing `All / Completed / Not Completed` completion dropdown, which technically hid completed tasks but defaulted to showing everything and was buried among the other filters.

## Behavior

Within each column, tasks split into two groups:

- **Incomplete tasks** — render at the top, draggable exactly as today.
- **Completed tasks** — collapse into a disclosure row at the bottom of the column:
  ```
  ✓ 3 completed  ▸
  ```
  - **Collapsed by default** (completed tasks hidden on load).
  - Clicking the row expands it, revealing the completed tasks (existing strikethrough / `bg-success/5` styling).
  - Expanded completed tasks remain interactive: clicking the checkmark un-completes them, clicking the card opens the view modal.
  - Completed tasks are **not draggable** (their relative order carries no meaning).
- The **column header count shows the incomplete count** (the actionable number). The completed count lives in the disclosure row.
- A column with zero completed tasks shows **no** disclosure row.

## URL Shape

Expanded/collapsed state lives in the URL via nuqs, consistent with the existing filter params.

```
/[board_id]?expanded=col-id-1,col-id-2
```

| Param      | Type     | Default | Description                                         |
|------------|----------|---------|-----------------------------------------------------|
| `expanded` | string[] | `[]`    | Column UUIDs whose Completed section is expanded     |

- Absent / empty `expanded` ⇒ all completed sections collapsed ⇒ completed hidden by default.
- A fresh visit or board navigation drops the param naturally, returning to the hidden-by-default state.
- Toggling a column adds/removes its id; clearing to empty writes `null` to keep the URL clean (same pattern as the other filter params).

## Search Interaction

When a search query (`q`) is active and a completed task in a column matches it, that column's Completed section **auto-expands** so the match is visible — regardless of the `expanded` param. This preserves the ability to find completed tasks by search even while they're hidden by default.

## What Gets Removed

The `All / Completed / Not Completed` completion dropdown is removed from `FilterBar`. Search and tag filters remain unchanged. This eliminates the overlapping mechanism — collapse-with-count is now the single way to manage completed-task visibility.

## Architecture

### `hooks/use-filter-params.ts`

- Remove `status` / `completion_filter` / `setCompletionFilter` and the `CompletionFilter` type / `COMPLETION_FILTERS` const.
- Add an `expanded` param + helpers:

```ts
const filter_parsers = {
    q:        parseAsString.withDefault(""),
    tags:     parseAsArrayOf(parseAsString).withDefault([]),
    expanded: parseAsArrayOf(parseAsString).withDefault([]),
};

// new helpers:
//   expanded_column_ids: string[]
//   toggleColumnExpanded(column_id: string): void
//   is_filters_active  -> q !== "" || tags.length > 0   (expanded is NOT a filter)
```

- `clearFilters` clears `q` and `tags` only — `expanded` is a view-state toggle, not a filter, so it is excluded from "Clear Filters" and from `is_filters_active`.

### `hooks/use-filtered-tasks.ts`

- Remove the completion-filter branch (no more `completion_filter`).
- Keep search + tag filtering. Return the filtered list as today; the incomplete/completed split happens in the column component (see below), not here.

### New: `hooks/use-column-tasks.ts` (or inline in `ColumnItem`)

Given a column's already-filtered tasks, derive:

```ts
{
    incomplete_tasks: Task[],   // task.isCompleted === false
    completed_tasks:  Task[],   // task.isCompleted === true
}
```

Ordering within each group follows the existing `taskOrder`-sorted input order.

### `components/columns/column-item.tsx`

- Apply `useFilteredTasks`, then split into incomplete / completed.
- Render `incomplete_tasks` in the existing draggable list (the `useDroppable` / sortable wiring is unchanged — it now contains only incomplete tasks).
- Render header count as `incomplete_tasks.length`.
- If `completed_tasks.length > 0`, render the new `CompletedSection` at the very bottom of the column, below `QuickAddTask` (so completed tasks sit beneath the quick-add row).

### New: `components/columns/completed-section.tsx`

- Reads `expanded_column_ids` + `toggleColumnExpanded` from `useFilterParams`, and `search_query`.
- Receives `completed_tasks` — already the post-filter set (search + tags applied upstream), so any task here already matches the active search.
- Determines `is_expanded = expanded_column_ids.includes(column.id) || (search_query !== "" && completed_tasks.length > 0)`. When auto-expanded by search, the chevron stays in sync but the URL `expanded` param is **not** mutated (it's a transient view override).
- Renders the disclosure row (`✓ {count} completed` + chevron) and, when expanded, maps `completed_tasks` to `TaskItem` with a flag disabling drag.

### `components/columns/task-item.tsx`

- Accept an optional prop (e.g. `is_completed_section?: boolean`) that disables the sortable wiring and hides the drag handle for tasks rendered inside the Completed section. Completion toggle + view-modal click stay enabled.

### `components/columns/filter-bar.tsx`

- Remove the completion `Select` block and its imports. Search input, tag popover, and Clear Filters button remain.

## Reorder / `taskOrder` Integrity (key technical risk)

Reorder persists by overwriting `column.taskOrder` with the rendered list's ids (`actions/task.actions.ts` → `reorderTaskAction`, `data: { taskOrder }`). Once the draggable list contains **only incomplete tasks**, a naive reorder would write a `taskOrder` missing every completed task id, corrupting their stored order.

**Fix:** when building `updated_task_order` in `column-list.tsx`'s `handleDragEnd`, merge the completed task ids back into the order before persisting, preserving their original positions relative to the full list. Concretely:

- Capture the full pre-drag `taskOrder` (incomplete + completed) from the snapshot.
- After computing the new incomplete-task order, reinsert completed task ids at their original indices (or append them, preserving relative order) so the persisted `taskOrder` still contains all task ids.

The drag handlers in `column-list.tsx` currently operate on full `column.tasks`; the split is a render concern in `ColumnItem`. The merge logic ensures the persisted order array is never truncated. This must be covered explicitly in the implementation plan and verified.

Note: drag-drop is already disabled while `is_filters_active` (`task-item.tsx:54`). Since `expanded` is excluded from `is_filters_active`, dragging incomplete tasks stays enabled in the normal (no search/tag) view.

## Files Changed

| File | Change |
|------|--------|
| `hooks/use-filter-params.ts` | Remove `status`/completion helpers; add `expanded` param + `toggleColumnExpanded`; exclude `expanded` from `is_filters_active`/`clearFilters` |
| `hooks/use-filtered-tasks.ts` | Remove completion-filter branch |
| `hooks/use-column-tasks.ts` | **Create** (or inline) — split filtered tasks into incomplete/completed |
| `components/columns/column-item.tsx` | Split tasks; render incomplete list + `CompletedSection`; header count = incomplete count |
| `components/columns/completed-section.tsx` | **Create** — collapsible disclosure of completed tasks |
| `components/columns/task-item.tsx` | Add `is_completed_section` prop to disable drag + hide handle |
| `components/columns/filter-bar.tsx` | Remove completion `Select` block |
| `components/columns/column-list.tsx` | `handleDragEnd` merges completed ids back into `updated_task_order` to preserve `taskOrder` |

## Out of Scope (YAGNI)

- No global "expand all / collapse all" board-level control — per-column is enough for now.
- No "show only completed" view — expanding a section covers that need.
- No archiving / deleting completed tasks — this is purely visibility, not lifecycle.
- No server-side changes beyond the existing `reorderTaskAction` (no schema or query changes).
