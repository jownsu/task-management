# Hide Completed Tasks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Group completed tasks into a per-column collapsible "Completed" section that is hidden (collapsed) by default, replacing the existing completion dropdown.

**Architecture:** Filtering/visibility stays client-side. `useFilterParams` gains an `expanded` URL param (nuqs) and loses the `status` completion param. `ColumnItem` splits its filtered tasks into incomplete (draggable, top) and completed (rendered inside a new collapsible `CompletedSection`). The drag-drop layer (`ColumnList`) is reworked to reorder incomplete tasks only and reconstruct each column as `[incomplete…, completed…]`, so the persisted `taskOrder` never loses completed ids.

**Tech Stack:** Next.js 16 / React 19 / TypeScript, nuqs (URL state), @dnd-kit/react, Tailwind v4, react-icons.

---

## Conventions (follow exactly)

- Variables `snake_case`, functions `camelCase`, components/types `PascalCase`, files `kebab-case`.
- Absolute imports via `@/`, grouped with labeled comments (`/* REACT */`, `/* COMPONENTS */`, `/* HOOKS */`, `/* TYPES */`, `/* UTILITIES */`, `/* ICONS */`, `/* PLUGINS */`).
- JSDoc on every function/component: `DOCU:` / `Triggered:` / `Last Updated: June 13, 2026` / `@author Jhones`.
- Tailwind arbitrary values are integers, no units (`gap-[20]`, not `gap-[20px]`).
- Icons from `react-icons` (here: `react-icons/md`).
- Prettier: tabs, double quotes, semicolons.

## Commit Policy (project rule — do not violate)

**Do NOT run `git commit` during any task.** The user reviews all changes before committing. Stage nothing automatically. The final commit (Task 9) happens only after the user explicitly approves.

## Automated Gate

There is **no test framework** in this project. After each code task, the gate is a clean TypeScript check:

```
npx tsc --noEmit
```

Expected: no errors. (First run may be slow.)

---

### Task 1: Add `expanded` param to `useFilterParams`, remove completion filter

**Files:**
- Modify: `hooks/use-filter-params.ts` (full rewrite below)

- [ ] **Step 1: Replace the file contents**

```ts
"use client";

/* REACT */
import { useCallback } from "react";

/* PLUGINS */
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";

/* CONSTANTS */
const filter_parsers = {
	q: parseAsString.withDefault(""),
	tags: parseAsArrayOf(parseAsString).withDefault([]),
	expanded: parseAsArrayOf(parseAsString).withDefault([]),
};

/**
 * DOCU: Provides URL-based filter and view state via nuqs — persists search query, tag filter, and expanded completed-section columns across refreshes. <br>
 * Triggered: In FilterBar, useFilteredTasks, TaskItem, ColumnItem, and CompletedSection. <br>
 * Last Updated: June 13, 2026
 * @author Jhones
 */
export const useFilterParams = () => {
	const [{ q, tags, expanded }, setFilters] = useQueryStates(filter_parsers, { shallow: true });

	/**
	 * DOCU: Updates the search query param. Clears param from URL when query is empty. <br>
	 * Triggered: When the debounced search input value changes. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const setSearchQuery = useCallback((query: string) => setFilters({ q: query || null }), [setFilters]);

	/**
	 * DOCU: Toggles a tag in the tags param — adds if not present, removes if present. Clears param when no tags remain. <br>
	 * Triggered: When the user checks or unchecks a tag in the tag filter popover. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const toggleTagFilter = useCallback(
		(tag_id: string) =>
			setFilters((prev) => {
				const new_tags = prev.tags.includes(tag_id) ? prev.tags.filter((id) => id !== tag_id) : [...prev.tags, tag_id];
				return { tags: new_tags.length === 0 ? null : new_tags };
			}),
		[setFilters]
	);

	/**
	 * DOCU: Toggles a column's completed-section expanded state — adds if collapsed, removes if expanded. Clears param when none remain. <br>
	 * Triggered: When the user clicks a column's "N completed" disclosure row. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const toggleColumnExpanded = useCallback(
		(column_id: string) =>
			setFilters((prev) => {
				const new_expanded = prev.expanded.includes(column_id) ? prev.expanded.filter((id) => id !== column_id) : [...prev.expanded, column_id];
				return { expanded: new_expanded.length === 0 ? null : new_expanded };
			}),
		[setFilters]
	);

	/**
	 * DOCU: Resets search and tag filters to defaults by removing them from the URL. Does not affect expanded view state. <br>
	 * Triggered: When the user clicks the clear filters button. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const clearFilters = useCallback(() => setFilters({ q: null, tags: null }), [setFilters]);

	return {
		search_query: q,
		selected_tag_ids: tags,
		expanded_column_ids: expanded,
		setSearchQuery,
		toggleTagFilter,
		toggleColumnExpanded,
		clearFilters,
		is_filters_active: q !== "" || tags.length > 0,
	};
};
```

Notes:
- `status`, `completion_filter`, `setCompletionFilter`, `CompletionFilter`, and `COMPLETION_FILTERS` are intentionally gone.
- `expanded` is deliberately **excluded** from `is_filters_active` and from `clearFilters` — it is view state, not a filter. This keeps drag-drop enabled (TaskItem disables drag on `is_filters_active`) while completed sections are collapsed/expanded.

- [ ] **Step 2: Typecheck (will still error in other files — that is expected here)**

Run: `npx tsc --noEmit`
Expected: errors ONLY in `hooks/use-filtered-tasks.ts` and `components/columns/filter-bar.tsx` (they still reference `completion_filter`). These are fixed in Tasks 2 and 3. No errors originating in `use-filter-params.ts` itself.

---

### Task 2: Remove completion-filter branch from `useFilteredTasks`

**Files:**
- Modify: `hooks/use-filtered-tasks.ts` (full rewrite below)

- [ ] **Step 1: Replace the file contents**

```ts
"use client";

/* REACT */
import { useMemo } from "react";

/* HOOKS */
import { useFilterParams } from "@/hooks/use-filter-params";

/* TYPES */
import { Task } from "@/types";

/**
 * DOCU: Filters an array of tasks based on current URL filter params (search, tags). Completion visibility is handled by the per-column CompletedSection, not here. <br>
 * Triggered: When column items render their task lists. <br>
 * Last Updated: June 13, 2026
 * @author Jhones
 */
export const useFilteredTasks = (tasks: Task[]): Task[] => {
	const { search_query, selected_tag_ids } = useFilterParams();

	return useMemo(() => {
		let filtered = tasks;

		/* Filter by search query (case-insensitive title match) */
		if (search_query) {
			const query = search_query.toLowerCase();
			filtered = filtered.filter((task) => task.title.toLowerCase().includes(query));
		}

		/* Filter by tags (OR logic — task must have ANY of the selected tags) */
		if (selected_tag_ids.length > 0) {
			filtered = filtered.filter((task) => task.tags.some((tag) => selected_tag_ids.includes(tag.id)));
		}

		return filtered;
	}, [tasks, search_query, selected_tag_ids]);
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors ONLY remaining in `components/columns/filter-bar.tsx` (fixed in Task 3).

---

### Task 3: Remove the completion `Select` from `FilterBar`

**Files:**
- Modify: `components/columns/filter-bar.tsx`

- [ ] **Step 1: Remove the `Select` import**

Delete this line (currently `filter-bar.tsx:12`):

```ts
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
```

- [ ] **Step 2: Fix the `useFilterParams` import — drop the `CompletionFilter` type**

Replace (currently `filter-bar.tsx:17`):

```ts
import { useFilterParams, type CompletionFilter } from "@/hooks/use-filter-params";
```

with:

```ts
import { useFilterParams } from "@/hooks/use-filter-params";
```

- [ ] **Step 3: Remove `completion_filter` and `setCompletionFilter` from the destructure**

Replace (currently `filter-bar.tsx:38`):

```ts
	const { search_query, completion_filter, selected_tag_ids, setSearchQuery, setCompletionFilter, toggleTagFilter, clearFilters, is_filters_active } = useFilterParams();
```

with:

```ts
	const { search_query, selected_tag_ids, setSearchQuery, toggleTagFilter, clearFilters, is_filters_active } = useFilterParams();
```

- [ ] **Step 4: Delete the Completion Filter `Select` block**

Remove this entire block (currently `filter-bar.tsx:83-93`):

```tsx
			{/* Completion Filter */}
			<Select value={completion_filter} onValueChange={(value) => setCompletionFilter(value as CompletionFilter)}>
				<SelectTrigger className="w-[170] bg-background">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Tasks</SelectItem>
					<SelectItem value="completed">Completed</SelectItem>
					<SelectItem value="not_completed">Not Completed</SelectItem>
				</SelectContent>
			</Select>
```

(The search input, tag popover, and Clear Filters button remain untouched.)

- [ ] **Step 5: Typecheck — should now be fully clean**

Run: `npx tsc --noEmit`
Expected: no errors anywhere.

---

### Task 4: Add `is_completed_section` prop to `TaskItem` (disable drag for completed tasks)

**Files:**
- Modify: `components/columns/task-item.tsx`

- [ ] **Step 1: Extend the `Props` interface**

Replace (currently `task-item.tsx:31-36`):

```ts
interface Props {
	column_id: string;
	task: Task;
	index: number;
	disabled?: boolean;
}
```

with:

```ts
interface Props {
	column_id: string;
	task: Task;
	index: number;
	disabled?: boolean;
	is_completed_section?: boolean;
}
```

- [ ] **Step 2: Destructure the new prop**

Replace (currently `task-item.tsx:38`):

```ts
const TaskItem = ({ task, column_id, index, disabled }: Props) => {
```

with:

```ts
const TaskItem = ({ task, column_id, index, disabled, is_completed_section }: Props) => {
```

- [ ] **Step 3: Disable the sortable for completed-section items**

Replace (currently `task-item.tsx:54`):

```ts
		disabled: disabled || is_filters_active
```

with:

```ts
		disabled: disabled || is_filters_active || is_completed_section
```

- [ ] **Step 4: Hide the drag handle for completed-section items**

Replace (currently `task-item.tsx:129`):

```tsx
			{!is_filters_active && (
```

with:

```tsx
			{!is_filters_active && !is_completed_section && (
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (`is_completed_section` is optional, so existing callers are unaffected.)

---

### Task 5: Create the `CompletedSection` component

**Files:**
- Create: `components/columns/completed-section.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

/* COMPONENTS */
import TaskItem from "@/components/columns/task-item";

/* HOOKS */
import { useFilterParams } from "@/hooks/use-filter-params";

/* TYPES */
import { Task } from "@/types";

/* UTILITIES */
import { cn } from "@/lib/utils";

/* ICONS */
import { MdCheckCircle, MdExpandMore } from "react-icons/md";

interface Props {
	column_id: string;
	completed_tasks: Task[];
	index_offset: number;
}

/**
 * DOCU: Renders a collapsible "N completed" disclosure for a column's completed tasks. Collapsed by default; auto-expands while a search query is active so matches stay visible. <br>
 * Triggered: At the bottom of each ColumnItem when the column has at least one completed task. <br>
 * Last Updated: June 13, 2026
 * @author Jhones
 */
const CompletedSection = ({ column_id, completed_tasks, index_offset }: Props) => {
	const { expanded_column_ids, toggleColumnExpanded, search_query } = useFilterParams();

	if (completed_tasks.length === 0) return null;

	/* Search forces expansion (completed_tasks here are already search-filtered) without mutating the URL param. */
	const is_expanded = expanded_column_ids.includes(column_id) || search_query !== "";

	return (
		<div className="flex flex-col gap-[20]">
			<button
				type="button"
				onClick={() => toggleColumnExpanded(column_id)}
				className="flex items-center gap-[8] text-h-sm text-medium-grey uppercase cursor-pointer transition-colors hover:text-success"
				aria-expanded={is_expanded}
			>
				<MdCheckCircle className="size-[16] text-success" />
				<span>{completed_tasks.length} completed</span>
				<MdExpandMore className={cn("size-[18] transition-transform", is_expanded && "rotate-180")} />
			</button>

			{is_expanded &&
				completed_tasks.map((task, index) => (
					<TaskItem
						key={task.id}
						task={task}
						column_id={column_id}
						index={index_offset + index}
						is_completed_section
					/>
				))}
		</div>
	);
};

export default CompletedSection;
```

Notes:
- `index_offset` keeps completed items' sortable indices after the incomplete items in the shared column group, avoiding any index collision (completed items are disabled sortables, so this is belt-and-suspenders correctness).
- While search is active the disclosure shows as expanded; clicking it still toggles the `expanded` URL param but has no visible effect until the search clears — acceptable transient behavior.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

---

### Task 6: Split tasks in `ColumnItem` and render `CompletedSection`

**Files:**
- Modify: `components/columns/column-item.tsx` (full rewrite below)

- [ ] **Step 1: Replace the file contents**

```tsx
/* COMPONENTS */
import TaskItem from "@/components/columns/task-item";
import QuickAddTask from "@/components/columns/quick-add-task";
import CompletedSection from "@/components/columns/completed-section";

/* PLUGINS */
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";

/* HOOKS */
import { useFilteredTasks } from "@/hooks/use-filtered-tasks";

/* TYPES */
import { Column } from "@/types";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	column: Column;
	is_reordering?: boolean;
}

/**
 * DOCU: Renders a single column — its header (with incomplete task count), the draggable incomplete task list, the collapsible completed section, and the quick-add input. <br>
 * Triggered: For each column in the task-management board's ColumnList. <br>
 * Last Updated: June 13, 2026
 * @author Jhones
 */
const ColumnItem = ({ column, is_reordering }: Props) => {

	const filtered_tasks = useFilteredTasks(column.tasks || []);
	const incomplete_tasks = filtered_tasks.filter((task) => !task.isCompleted);
	const completed_tasks = filtered_tasks.filter((task) => task.isCompleted);

	const {ref} = useDroppable({
		id: column.id,
		type: "column",
		accept: "task",
		collisionPriority: CollisionPriority.Low,
	});

	return (
		<div className="shrink-0 w-[280] flex flex-col gap-[24]">
			<div className="flex items-center gap-[12]">
				<span className="size-[15] rounded-full block" style={{ backgroundColor: column.theme }}></span>
				<span className="text-h-sm text-medium-grey uppercase">
					{column.name} ({incomplete_tasks.length})
				</span>
			</div>

			<div
				ref={ref}
				className={cn("flex flex-col gap-[20] min-h-full h-full rounded-lg")}
			>
				{incomplete_tasks.map((task, index) => (
					<TaskItem
						key={task.id}
						task={task}
						column_id={column.id}
						index={index}
						disabled={is_reordering}
					/>
				))}
				<QuickAddTask column_id={column.id} />
				<CompletedSection
					column_id={column.id}
					completed_tasks={completed_tasks}
					index_offset={incomplete_tasks.length}
				/>
			</div>
		</div>
	);
};

export default ColumnItem;
```

Notes:
- Header count is now `incomplete_tasks.length` (the actionable number).
- Incomplete tasks keep their existing sortable indices (`0..n-1`); completed items are offset after them inside `CompletedSection`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

---

### Task 7: Rework `ColumnList` drag-drop to reorder incomplete tasks only

**Files:**
- Modify: `components/columns/column-list.tsx` — only `handleDragOver` (currently lines 56-71) and `handleDragEnd`'s order-building (currently around lines 93-118).

Why: now that only incomplete tasks render as sortables, the dnd `move()` must operate on an incomplete-only map that matches the rendered items. Each column is then reconstructed as `[reordered incomplete…, completed…]` so `handleDragEnd` (which maps `target_column.tasks` → ids) still persists a complete `taskOrder`. Completed ids land at the end of the order; their position is irrelevant since they render in the separate CompletedSection.

- [ ] **Step 1: Replace `handleDragOver`**

Replace (currently `column-list.tsx:56-71`):

```ts
	const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = (event) => {
		setColumns((prev) => {
			const tasks_map: Record<string, Task[]> = {};

			for (const column of prev) {
				tasks_map[column.id] = column.tasks || [];
			}

			const updated_map = move(tasks_map, event);

			return prev.map((column) => ({
				...column,
				tasks: updated_map[column.id] || [],
			}));
		});
	};
```

with:

```ts
	const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = (event) => {
		setColumns((prev) => {
			const tasks_map: Record<string, Task[]> = {};

			/* Only incomplete tasks are rendered as sortables, so reorder operates on those alone. */
			for (const column of prev) {
				tasks_map[column.id] = (column.tasks || []).filter((task) => !task.isCompleted);
			}

			const updated_map = move(tasks_map, event);

			/* Reconstruct each column as [reordered incomplete..., completed...] so completed ids are never dropped from taskOrder. */
			return prev.map((column) => {
				const completed_tasks = (column.tasks || []).filter((task) => task.isCompleted);
				return {
					...column,
					tasks: [...(updated_map[column.id] || []), ...completed_tasks],
				};
			});
		});
	};
```

- [ ] **Step 2: Verify `handleDragEnd` needs no change**

Confirm `handleDragEnd` still builds `updated_task_order` from the full reconstructed list (currently `column-list.tsx:102`):

```ts
		const updated_task_order = target_column.tasks?.map((task) => task.id) || [];
```

Because `handleDragOver` now reconstructs `tasks` as `[incomplete…, completed…]`, `target_column.tasks` contains **all** ids (incomplete reordered + completed appended). No edit needed here — leave it as is. Do not filter completed out when building `updated_task_order`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

---

### Task 8: Manual verification in the browser

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Open the app and navigate to a task-management board that has both completed and incomplete tasks (mark a few tasks complete first if needed).

- [ ] **Step 2: Verify hidden-by-default + collapse**

Expected:
- Each column shows only incomplete tasks; the header count equals the number of incomplete tasks.
- Columns with completed tasks show a `✓ N completed ▸` row at the bottom (above the quick-add).
- Columns with zero completed tasks show NO disclosure row.
- Clicking the disclosure expands it to reveal the completed tasks (strikethrough style); the chevron rotates; clicking again collapses.

- [ ] **Step 3: Verify URL persistence**

Expected:
- Expanding a column adds `?expanded=<column-id>` to the URL; expanding a second adds a comma-separated id.
- Refreshing the page keeps the same columns expanded.
- Collapsing all removes the `expanded` param from the URL.
- Navigating to a different board drops `expanded` (completed hidden again).

- [ ] **Step 4: Verify the completion dropdown is gone**

Expected: the FilterBar shows only the search input, the Tags button, and (when active) Clear Filters. No `All/Completed/Not Completed` dropdown.

- [ ] **Step 5: Verify search auto-expand**

Expected:
- With completed sections collapsed, typing a query that matches a completed task auto-expands that column's completed section so the match shows.
- Clearing the search returns the section to its prior collapsed state (unless it was in `expanded`).

- [ ] **Step 6: Verify drag-drop + taskOrder integrity (the key risk)**

Expected:
- Drag an incomplete task to a new position within its column → it stays after refresh (order persisted).
- Drag an incomplete task to a different column → it moves and persists after refresh.
- After reordering, expand the completed sections of the affected columns and refresh: **no completed task disappeared and none were duplicated.** Completed tasks remain present (now ordered at the end of their column).
- Toggle a completed task back to incomplete (via its checkmark while expanded) → it rejoins the incomplete list and the counts update.

- [ ] **Step 7: Stop the dev server**

Stop the `npm run dev` process once verification passes.

---

### Task 9: Commit (ONLY after user approval)

**Files:** all changed files.

- [ ] **Step 1: Confirm the user has reviewed and explicitly approved a commit**

Do not proceed without explicit permission (project rule: never auto-commit).

- [ ] **Step 2: Stage and commit**

```bash
git add hooks/use-filter-params.ts hooks/use-filtered-tasks.ts \
	components/columns/filter-bar.tsx components/columns/task-item.tsx \
	components/columns/completed-section.tsx components/columns/column-item.tsx \
	components/columns/column-list.tsx \
	docs/superpowers/specs/2026-06-13-hide-completed-tasks-design.md \
	docs/superpowers/plans/2026-06-13-hide-completed-tasks.md
git commit -m "feat: collapsible completed-task section, hidden by default

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Per-column collapsible Completed section, collapsed by default → Tasks 5, 6.
- Header shows incomplete count → Task 6.
- No disclosure when zero completed → Task 5 (early `return null`).
- Expanded state in URL via nuqs (`expanded`) → Task 1; persistence verified in Task 8.
- Search auto-expand → Task 5; verified Task 8.
- Remove completion dropdown → Task 3.
- Completed tasks not draggable → Task 4 (`is_completed_section` disables sortable + hides handle).
- `taskOrder` integrity on reorder → Task 7; verified Task 8 step 6.
- `expanded` excluded from `is_filters_active`/`clearFilters` (keeps drag enabled) → Task 1.

**Placeholder scan:** none — every code step shows complete code.

**Type consistency:** `is_completed_section` (Task 4 prop) matches usage in Task 5. `expanded_column_ids` / `toggleColumnExpanded` / `search_query` returned in Task 1 match consumption in Task 5. `index_offset` defined in Task 5 `Props` matches the call in Task 6. `incomplete_tasks` / `completed_tasks` naming consistent across Tasks 6 and 7.
