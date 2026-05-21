# nuqs Filter Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Zustand `useFilterStore` with a nuqs URL-state hook so filter values persist across page refreshes.

**Architecture:** A single shared hook `hooks/use-filter-params.ts` wraps nuqs `useQueryStates` and exposes the same API shape as the old store. All three consumers (`filter-bar.tsx`, `use-filtered-tasks.ts`, `task-item.tsx`) import from this hook instead of the store. The Zustand store is deleted.

**Tech Stack:** nuqs v2 (`useQueryStates`, `parseAsString`, `parseAsStringLiteral`, `parseAsArrayOf`) — already installed with `NuqsAdapter` in `app/layout.tsx`.

---

## File Map

| Action | Path |
|--------|------|
| Create | `hooks/use-filter-params.ts` |
| Modify | `components/columns/filter-bar.tsx` |
| Modify | `hooks/use-filtered-tasks.ts` |
| Modify | `components/columns/task-item.tsx` |
| Delete | `store/filter.store.ts` |

---

### Task 1: Create `hooks/use-filter-params.ts`

**Files:**
- Create: `hooks/use-filter-params.ts`

- [ ] **Step 1: Create the hook file**

Write `hooks/use-filter-params.ts` with this exact content:

```ts
"use client";

/* PLUGINS */
import { parseAsArrayOf, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

type CompletionFilter = "all" | "completed" | "not_completed";

const COMPLETION_FILTERS = ["all", "completed", "not_completed"] as const;

const filter_parsers = {
	q: parseAsString.withDefault(""),
	status: parseAsStringLiteral(COMPLETION_FILTERS).withDefault("all"),
	tags: parseAsArrayOf(parseAsString).withDefault([]),
};

/**
 * DOCU: Provides URL-based filter state via nuqs — persists search query, completion filter, and tag filter across page refreshes. <br>
 * Triggered: In FilterBar, useFilteredTasks, and TaskItem. <br>
 * Last Updated: May 21, 2026
 * @author Jhones
 */
export const useFilterParams = () => {
	const [{ q, status, tags }, setFilters] = useQueryStates(filter_parsers, { shallow: true });

	/**
	 * DOCU: Updates the search query param. Clears param from URL when query is empty. <br>
	 * Triggered: When the debounced search input value changes. <br>
	 * Last Updated: May 21, 2026
	 * @author Jhones
	 */
	const setSearchQuery = (query: string) => setFilters({ q: query || null });

	/**
	 * DOCU: Sets the completion status filter param. Removes param from URL when set to default "all". <br>
	 * Triggered: When the user selects a completion filter option. <br>
	 * Last Updated: May 21, 2026
	 * @author Jhones
	 */
	const setCompletionFilter = (filter: CompletionFilter) => setFilters({ status: filter === "all" ? null : filter });

	/**
	 * DOCU: Toggles a tag in the tags param — adds if not present, removes if present. Clears param when no tags remain. <br>
	 * Triggered: When the user checks or unchecks a tag in the tag filter popover. <br>
	 * Last Updated: May 21, 2026
	 * @author Jhones
	 */
	const toggleTagFilter = (tag_id: string) =>
		setFilters((prev) => {
			const new_tags = prev.tags.includes(tag_id) ? prev.tags.filter((id) => id !== tag_id) : [...prev.tags, tag_id];
			return { tags: new_tags.length === 0 ? null : new_tags };
		});

	/**
	 * DOCU: Resets all filter params to defaults by removing them from the URL. <br>
	 * Triggered: When the user clicks the clear filters button. <br>
	 * Last Updated: May 21, 2026
	 * @author Jhones
	 */
	const clearFilters = () => setFilters({ q: null, status: null, tags: null });

	return {
		search_query: q,
		completion_filter: status as CompletionFilter,
		selected_tag_ids: tags,
		setSearchQuery,
		setCompletionFilter,
		toggleTagFilter,
		clearFilters,
		is_filters_active: q !== "" || status !== "all" || tags.length > 0,
	};
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/jownsu/Documents/Jownsu/task-management && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `use-filter-params.ts`.

---

### Task 2: Update `components/columns/filter-bar.tsx`

**Files:**
- Modify: `components/columns/filter-bar.tsx`

Key changes:
- Remove `/* STORE */` import, add `/* HOOKS */` import for `useFilterParams`
- Replace all `useFilterStore` calls with a single `useFilterParams()` destructure
- Initialize `local_search` from `search_query` (so input is pre-filled on refresh)
- Remove the `clearFilters` on `board_id` change `useEffect` — URL params naturally reset on board navigation

- [ ] **Step 1: Replace the file content**

Write `components/columns/filter-bar.tsx` with this exact content:

```tsx
"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useEffect, useState } from "react";

/* COMPONENTS */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

/* HOOKS */
import { useFilterParams } from "@/hooks/use-filter-params";

/* QUERIES */
import { useGetTaskManagementBoard } from "@/hooks/queries/task-management-board.query";

/* ICONS */
import { MdSearch, MdFilterList, MdClose } from "react-icons/md";

/* UTILITIES */
import { cn } from "@/lib/utils";

/**
 * DOCU: Renders the filter bar with search input, completion filter, tag filter, and clear button. <br>
 * Triggered: When the board page renders above the column list. <br>
 * Last Updated: May 21, 2026
 * @author Jhones
 */
const FilterBar = () => {
	const { board_id } = useParams() as { board_id: string };
	const { board } = useGetTaskManagementBoard(board_id);

	const { search_query, completion_filter, selected_tag_ids, setSearchQuery, setCompletionFilter, toggleTagFilter, clearFilters, is_filters_active } = useFilterParams();

	const [local_search, setLocalSearch] = useState(search_query);

	/**
	 * DOCU: Debounces the local search input and updates the URL search param after 300ms. <br>
	 * Triggered: When the local search input value changes. <br>
	 * Last Updated: May 21, 2026
	 * @author Jhones
	 */
	useEffect(() => {
		const timeout = setTimeout(() => {
			setSearchQuery(local_search);
		}, 300);

		return () => clearTimeout(timeout);
	}, [local_search]);

	/**
	 * DOCU: Syncs the local search input when the URL search param is cleared externally. <br>
	 * Triggered: When search_query resets to empty (e.g., via clearFilters). <br>
	 * Last Updated: May 21, 2026
	 * @author Jhones
	 */
	useEffect(() => {
		if (search_query === "") {
			setLocalSearch("");
		}
	}, [search_query]);

	return (
		<div className="flex flex-wrap items-center gap-[12] mb-[20] sticky top-[120] left-[324] z-50">
			{/* Search Input */}
			<div className="relative">
				<MdSearch className="absolute left-[12] top-1/2 -translate-y-1/2 size-[18] text-medium-grey z-10" />
				<Input
					value={local_search}
					onChange={(e) => setLocalSearch(e.target.value)}
					placeholder="Search tasks..."
					containerClassName="w-[220] bg-background"
					className="pl-[36]"
				/>
			</div>

			{/* Completion Filter */}
			<Select value={completion_filter} onValueChange={(value) => setCompletionFilter(value as "all" | "completed" | "not_completed")}>
				<SelectTrigger className="w-[170] bg-background">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Tasks</SelectItem>
					<SelectItem value="completed">Completed</SelectItem>
					<SelectItem value="not_completed">Not Completed</SelectItem>
				</SelectContent>
			</Select>

			{/* Tag Filter */}
			{board?.tags && board.tags.length > 0 && (
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="secondary" size="default" className={cn("gap-[8]", selected_tag_ids.length > 0 && "ring-2 ring-primary/30")}>
							<MdFilterList className="size-[16]" />
							Tags
							{selected_tag_ids.length > 0 && (
								<span className="bg-primary text-white rounded-full size-[20] flex items-center justify-center t-[11]">
									{selected_tag_ids.length}
								</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-[220] p-[12] bg-foreground border border-lines shadow-lg">
						<p className="text-h-sm text-medium-grey mb-[12]">Filter by Tag</p>
						<div className="flex flex-col gap-[8] max-h-[200] overflow-y-auto">
							{board.tags.map((tag) => (
								<label key={tag.id} className="flex items-center gap-[10] cursor-pointer hover:bg-muted/50 rounded-md px-[8] py-[6]">
									<Checkbox
										checked={selected_tag_ids.includes(tag.id)}
										onCheckedChange={() => toggleTagFilter(tag.id)}
									/>
									<span className="size-[10] rounded-full shrink-0" style={{ backgroundColor: tag.color }}></span>
									<span className="text-b-lg truncate">{tag.name}</span>
								</label>
							))}
						</div>
					</PopoverContent>
				</Popover>
			)}

			{/* Clear Filters */}
			{is_filters_active && (
				<Button variant="ghost" size="sm" onClick={clearFilters} className="gap-[6] text-medium-grey hover:text-destructive">
					<MdClose className="size-[16]" />
					Clear Filters
				</Button>
			)}
		</div>
	);
};

export default FilterBar;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/jownsu/Documents/Jownsu/task-management && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `filter-bar.tsx`.

---

### Task 3: Update `hooks/use-filtered-tasks.ts`

**Files:**
- Modify: `hooks/use-filtered-tasks.ts`

- [ ] **Step 1: Replace the file content**

Write `hooks/use-filtered-tasks.ts` with this exact content:

```ts
/* REACT */
import { useMemo } from "react";

/* HOOKS */
import { useFilterParams } from "@/hooks/use-filter-params";

/* TYPES */
import { Task } from "@/types";

/**
 * DOCU: Filters an array of tasks based on current URL filter params (search, completion, tags). <br>
 * Triggered: When column items render their task lists. <br>
 * Last Updated: May 21, 2026
 * @author Jhones
 */
export const useFilteredTasks = (tasks: Task[]): Task[] => {
	const { search_query, completion_filter, selected_tag_ids } = useFilterParams();

	return useMemo(() => {
		let filtered = tasks;

		/* Filter by completion status */
		if (completion_filter === "completed") {
			filtered = filtered.filter((task) => task.isCompleted);
		} else if (completion_filter === "not_completed") {
			filtered = filtered.filter((task) => !task.isCompleted);
		}

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
	}, [tasks, search_query, completion_filter, selected_tag_ids]);
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/jownsu/Documents/Jownsu/task-management && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `use-filtered-tasks.ts`.

---

### Task 4: Update `components/columns/task-item.tsx` and delete the store

**Files:**
- Modify: `components/columns/task-item.tsx`
- Delete: `store/filter.store.ts`

- [ ] **Step 1: Update the import and store call in `task-item.tsx`**

Remove the `/* STORE */ import { useFilterStore }` line and replace the `is_filters_active` line.

Old section to remove (lines 13–14 in the current file):
```tsx
/* STORE */
import { useFilterStore } from "@/store/filter.store";
```

Add after the existing `/* STORE */` import for `useTaskStore` (keep `useTaskStore`, only remove `useFilterStore`):
```tsx
/* HOOKS */
import { useFilterParams } from "@/hooks/use-filter-params";
```

Old line to remove (line 40):
```tsx
const is_filters_active = useFilterStore((state) => state.search_query !== "" || state.completion_filter !== "all" || state.selected_tag_ids.length > 0);
```

Replace with:
```tsx
const { is_filters_active } = useFilterParams();
```

The final imports block in `task-item.tsx` should look like this:

```tsx
/* STORE */
import { useTaskStore } from "@/store/task.store";

/* HOOKS */
import { useFilterParams } from "@/hooks/use-filter-params";
```

And inside `TaskItem`, the hook call:
```tsx
const { is_filters_active } = useFilterParams();
```

- [ ] **Step 2: Delete `store/filter.store.ts`**

```bash
rm /Users/jownsu/Documents/Jownsu/task-management/store/filter.store.ts
```

- [ ] **Step 3: Verify no remaining references to the deleted store**

```bash
grep -r "filter\.store\|useFilterStore" /Users/jownsu/Documents/Jownsu/task-management --include="*.ts" --include="*.tsx"
```

Expected: no output.

- [ ] **Step 4: Verify TypeScript compiles cleanly**

```bash
cd /Users/jownsu/Documents/Jownsu/task-management && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

