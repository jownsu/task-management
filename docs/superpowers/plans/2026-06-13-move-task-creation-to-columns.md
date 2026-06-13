# Move Task Creation Into Columns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the global navbar "Add New Task" button and fold its capability into each column's quick-add via an always-visible expand icon that opens the existing create-task modal pre-scoped to that column.

**Architecture:** A new Zustand action (`openAddTask`) carries a target `column_id` and an initial title into the existing `create-task-modal`, which already reads its state from the task store. The quick-add row gains an expand icon button that calls it; the navbar action component drops its button. No mutation, schema, or server-action changes.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript 5, Zustand v5, react-hook-form + Zod, Tailwind v4, react-icons.

**Testing note:** This repo has **no test framework** (per CLAUDE.md). "Verification" steps below are manual: `npx tsc --noEmit`, `npm run build`, and running the app. There are no unit tests to write. Do **not** add a test framework.

**Commit policy:** Per CLAUDE.md, **NEVER run `git commit`**. The user reviews all files before committing. Each task ends with a *staging-only* step (`git add`) and a manual verification gate — do **not** commit.

---

## File Structure

| File | Responsibility | Change |
|------|----------------|--------|
| `store/task.store.ts` | Task modal + selection state | Add `add_task_column_id`, `add_task_initial_title`, `openAddTask`, `resetAddTask` |
| `components/task/create-task-modal.tsx` | Full create-task form modal | Default `column_id` + `title` from store on open; clear store fields on close |
| `components/columns/quick-add-task.tsx` | Per-column inline quick-add | Add expand icon button calling `openAddTask`, then clear input |
| `components/navigation/task-management-nav-actions.tsx` | Board-scoped navbar actions | Remove "Add New Task" button; keep `ActionOptions` dropdown |

**Task order rationale:** Store first (Task 1) so the consumers (modal, quick-add) compile against real fields. Modal next (Task 2) so the pre-fill works before the trigger exists. Quick-add (Task 3) wires the trigger. Navbar cleanup last (Task 4) removes the old path once the new one is proven.

---

### Task 1: Add column-scoped add-task state to the task store

**Files:**
- Modify: `store/task.store.ts`

**Context:** The store currently exposes `modals`, `selected_task_id`, `selected_column_id`, `setModal`, and `setSelectedTask`. We add a *separate* pair of fields for the add-task pre-fill so we don't overload `selected_*` (which serve view/edit). `openAddTask` opens the modal scoped to a column; `resetAddTask` clears the pre-fill (called by the modal on close).

- [ ] **Step 1: Add the new fields and actions to the `TaskStore` interface and `create` body**

Replace the entire contents of `store/task.store.ts` with:

```typescript
/* PLUGINS */
import { create } from "zustand";

interface Modals {
	add_task: boolean;
	edit_task: boolean;
	view_task: boolean;
	delete_task: boolean;
}

interface TaskStore {
	modals: Modals;
	selected_task_id: string | null;
	selected_column_id: string | null;
	add_task_column_id: string | null;
	add_task_initial_title: string;
	setModal: (modal: keyof Modals, value: boolean) => void;
	setSelectedTask: (task_id: string, column_id: string) => void;
	openAddTask: (column_id: string, initial_title: string) => void;
	resetAddTask: () => void;
}

export const useTaskStore = create<TaskStore>()((set) => ({
	modals: {
		add_task: false,
		edit_task: false,
		view_task: false,
		delete_task: false
	},
	selected_task_id: null,
	selected_column_id: null,
	add_task_column_id: null,
	add_task_initial_title: "",
	setModal: (modal, value) =>
		set((state) => ({
			modals: {
				...state.modals,
				[modal]: value
			}
		})),
	setSelectedTask: (selected_task_id, selected_column_id) => set({ selected_task_id, selected_column_id }),
	/**
	 * DOCU: Opens the add-task modal pre-scoped to a column, carrying an initial title. <br>
	 * Triggered: From a column quick-add's expand button. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	openAddTask: (add_task_column_id, add_task_initial_title) =>
		set((state) => ({
			add_task_column_id,
			add_task_initial_title,
			modals: { ...state.modals, add_task: true }
		})),
	/**
	 * DOCU: Clears the add-task pre-fill fields. <br>
	 * Triggered: When the add-task modal closes. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	resetAddTask: () => set({ add_task_column_id: null, add_task_initial_title: "" })
}));
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: PASS (no errors). The new fields are additive; existing consumers of `setModal`/`setSelectedTask` are unaffected.

- [ ] **Step 3: Stage (do NOT commit)**

```bash
git add store/task.store.ts
```

---

### Task 2: Pre-fill the create-task modal from the store and clear on close

**Files:**
- Modify: `components/task/create-task-modal.tsx`

**Context:** `CreateTaskModal` is the single page-level modal driven by `modals.add_task`. Today its open-reset `useEffect` always defaults `column_id` to the first column and `title` to `""`. We change those defaults to read the store's `add_task_column_id` / `add_task_initial_title`, and we clear those store fields whenever the modal closes (Cancel, outside-click/Esc via `onOpenChange`, and successful create). All three close paths must funnel through one handler to stay DRY.

- [ ] **Step 1: Read the new store fields + `resetAddTask`**

In `components/task/create-task-modal.tsx`, locate the existing store reads (around lines 58-60):

```typescript
	const setModal = useTaskStore((state) => state.setModal);
	const modals = useTaskStore((state) => state.modals);
```

Add immediately below them:

```typescript
	const add_task_column_id = useTaskStore((state) => state.add_task_column_id);
	const add_task_initial_title = useTaskStore((state) => state.add_task_initial_title);
	const resetAddTask = useTaskStore((state) => state.resetAddTask);
```

- [ ] **Step 2: Add a single close handler that also clears the pre-fill**

Immediately after the `useCreateTask` hook block (the `const { createTask, isPending } = useCreateTask({ ... });` call, around lines 61-63), add:

```typescript
	/**
	 * DOCU: Closes the add-task modal and clears the column/title pre-fill so the next open starts clean. <br>
	 * Triggered: On Cancel, outside-click/Esc, or after a successful create. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const closeAddTask = () => {
		setModal("add_task", false);
		resetAddTask();
	};
```

- [ ] **Step 3: Route the success callback through the close handler**

Change the `useCreateTask` callback from:

```typescript
	const { createTask, isPending } = useCreateTask({
		onSuccess: () => setModal("add_task", false)
	});
```

to:

```typescript
	const { createTask, isPending } = useCreateTask({
		onSuccess: () => closeAddTask()
	});
```

Note: `closeAddTask` is declared after this hook in source order, but it is only *called* inside the async `onSuccess` callback at runtime, so the reference resolves fine (function/const hoisting within the component render closure). Keep `closeAddTask` declared right after the hook as in Step 2.

- [ ] **Step 4: Use the store values as the open-reset defaults**

Replace the existing open-reset effect (around lines 164-174):

```typescript
	useEffect(() => {
		if (modals.add_task) {
			form.reset({
				title: "",
				description: "",
				sub_tasks: [],
				column_id: board?.columns?.[0]?.id || "",
			tag_ids: []
			});
		}
	}, [modals.add_task, form, board]);
```

with:

```typescript
	useEffect(() => {
		if (modals.add_task) {
			form.reset({
				title: add_task_initial_title,
				description: "",
				sub_tasks: [],
				column_id: add_task_column_id ?? board?.columns?.[0]?.id ?? "",
				tag_ids: []
			});
		}
	}, [modals.add_task, form, board, add_task_column_id, add_task_initial_title]);
```

- [ ] **Step 5: Route the Dialog `onOpenChange` and Cancel button through the close handler**

Change the `Dialog` open-change (around lines 177-180) from:

```typescript
		<Dialog
			open={modals.add_task}
			onOpenChange={(value) => setModal("add_task", value)}
		>
```

to:

```typescript
		<Dialog
			open={modals.add_task}
			onOpenChange={(value) => {
				if (!value) {
					closeAddTask();
				}
			}}
		>
```

And change the Cancel button (around line 355) from:

```typescript
							<Button type="button" variant="secondary" className="w-full" disabled={isPending} onClick={() => setModal("add_task", false)}>
								Cancel
							</Button>
```

to:

```typescript
							<Button type="button" variant="secondary" className="w-full" disabled={isPending} onClick={() => closeAddTask()}>
								Cancel
							</Button>
```

- [ ] **Step 6: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 7: Verify the build compiles**

Run: `npm run build`
Expected: PASS (build completes). The modal still renders identically; only its defaults + close wiring changed.

- [ ] **Step 8: Stage (do NOT commit)**

```bash
git add components/task/create-task-modal.tsx
```

---

### Task 3: Add the expand-to-modal button on the column quick-add

**Files:**
- Modify: `components/columns/quick-add-task.tsx`

**Context:** `QuickAddTask` is an inline title-only input rendered in every column. We add an always-visible expand icon button (`MdOpenInFull` from `react-icons/md`, matching the app's icon set used in `task-item.tsx`) between the input and the existing `+` add button. Clicking it promotes the current draft into the full modal via `openAddTask`, then clears the input.

- [ ] **Step 1: Import the store hook and the expand icon**

In `components/columns/quick-add-task.tsx`, the current imports are:

```typescript
/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useRef, useState } from "react";

/* PLUGINS */
import { IoMdAdd } from "react-icons/io";

/* MUTATIONS */
import { useCreateTask } from "@/hooks/mutations/task.mutation";
```

Replace that import block with (adds the STORE group and the `MdOpenInFull` icon; `react-icons` imports live under the ICONS group per conventions):

```typescript
/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useRef, useState } from "react";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* MUTATIONS */
import { useCreateTask } from "@/hooks/mutations/task.mutation";

/* ICONS */
import { IoMdAdd } from "react-icons/io";
import { MdOpenInFull } from "react-icons/md";
```

- [ ] **Step 2: Read `openAddTask` from the store**

Inside the component, after the existing `const input_ref = useRef<HTMLInputElement>(null);` line (around line 28), add:

```typescript
	const openAddTask = useTaskStore((state) => state.openAddTask);
```

- [ ] **Step 3: Add the escalation handler**

After the existing `handleKeyDown` function (around line 70, before the `return`), add:

```typescript
	/**
	 * DOCU: Promotes the current quick-add draft into the full create-task modal, pre-scoped to this column. <br>
	 * Triggered: On clicking the expand button in the quick-add row. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const handleOpenDetailed = () => {
		openAddTask(column_id, title.trim());
		setTitle("");
	};
```

- [ ] **Step 4: Render the expand button between the input and the add button**

The current return's button (around lines 84-92) is the trailing `+` add button:

```typescript
			<button
				type="button"
				onClick={handleSubmit}
				disabled={!title.trim() || isPending}
				aria-label="Add task"
				className="text-primary hover:text-primary/80 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-opacity"
			>
				<IoMdAdd size={20} />
			</button>
```

Insert the expand button **immediately before** that `+` button (so order is input → expand → add):

```typescript
			<button
				type="button"
				onClick={handleOpenDetailed}
				disabled={isPending}
				aria-label="Add task with details"
				className="text-medium-grey hover:text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
			>
				<MdOpenInFull size={16} />
			</button>
```

- [ ] **Step 5: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Stage (do NOT commit)**

```bash
git add components/columns/quick-add-task.tsx
```

---

### Task 4: Remove the "Add New Task" button from the navbar actions

**Files:**
- Modify: `components/navigation/task-management-nav-actions.tsx`

**Context:** With per-column creation in place, the navbar's global "Add New Task" button is removed. The board `ActionOptions` dropdown (edit / delete / edit tags) stays. The component now no longer needs `Button`, `FaPlus`, or `setTaskModal`.

- [ ] **Step 1: Remove the now-unused imports**

Remove the `Button` import line:

```typescript
import { Button } from "@/components/ui/button";
```

Remove the `FaPlus` icon import line:

```typescript
import { FaPlus } from "react-icons/fa";
```

(Leave the `ActionOptions`, `useBoardStore`, `useTaskStore`, and `useGetTaskManagementBoard` imports — see Step 2 for the `useTaskStore` decision.)

- [ ] **Step 2: Drop the `setTaskModal` read**

Remove this line from the component body:

```typescript
	const setTaskModal = useTaskStore((state) => state.setModal);
```

Since `setTaskModal` was the only use of `useTaskStore` in this file, also remove its import:

```typescript
import { useTaskStore } from "@/store/task.store";
```

- [ ] **Step 3: Remove the button from the JSX**

Remove the `<Button>` block (the "Add New Task" button) so the returned fragment contains only `<ActionOptions ... />`:

```typescript
			<Button type="button" className="text-md h-[32] w-[48] md:h-[48] md:w-fit md:!px-[24]" onClick={() => setTaskModal("add_task", true)}>
				<FaPlus className="size-[12]" /> <span className="hidden md:block">Add New Task</span>
			</Button>
```

After removal the component returns:

```typescript
	return (
		<>
			<ActionOptions
				name="Board"
				onDeleteClick={() => {
					if (task_management_board) {
						setBoardModal("delete_board", true);
						setSelectedBoard(task_management_board);
					}
				}}
				onEditClick={() => {
					if (task_management_board) {
						setBoardModal("edit_board", true);
						setSelectedBoard(task_management_board);
					}
				}}
				onEditTagsClick={() => {
					if (task_management_board) {
						setBoardModal("edit_tags", true);
						setSelectedBoard(task_management_board);
					}
				}}
			/>
		</>
	);
```

(The wrapping `<>...</>` fragment may stay as-is; leaving it avoids churn and keeps the single-child render valid.)

- [ ] **Step 4: Verify it typechecks (catches any leftover unused symbol)**

Run: `npx tsc --noEmit`
Expected: PASS, with no "declared but never read" errors for `Button`, `FaPlus`, `setTaskModal`, or `useTaskStore`.

- [ ] **Step 5: Verify the build compiles**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Stage (do NOT commit)**

```bash
git add components/navigation/task-management-nav-actions.tsx
```

---

## Final Verification (manual, in-browser)

After all four tasks, run the app and confirm the spec's behavior. There is no automated test suite — this is the verification.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Open the app and navigate to a TASK_MANAGEMENT board.

- [ ] **Step 2: Navbar no longer shows "Add New Task"**

Expected: The navbar shows the board name and the board actions dropdown (⋯), but **no** "Add New Task" button. The dropdown's Edit/Delete/Edit Tags still open their modals.

- [ ] **Step 3: Expand icon present on every column**

Expected: Each column's quick-add row shows: input, then an expand icon (⤢), then the `+` button.

- [ ] **Step 4: Escalate with a typed title**

Type "Buy milk" into column B's quick-add, click the expand icon.
Expected: The full modal opens with **Title = "Buy milk"** and the **Column select = Column B**. The inline input is now cleared.

- [ ] **Step 5: Escalate with an empty input**

Click the expand icon on column C with nothing typed.
Expected: Modal opens blank, **Column select = Column C**.

- [ ] **Step 6: Inline quick-add still works**

Type a title in column A, press Enter.
Expected: A title-only task is created instantly in column A; no modal opens.

- [ ] **Step 7: No stale carry-over**

Open via column C's expand (title "X"), Cancel, then open via column A's expand with no text.
Expected: Modal shows empty title and **Column = A** — no leftover "X" or column C.

- [ ] **Step 8: Create from the modal**

Open via a column's expand, fill details, click Create.
Expected: Task is created in the pre-selected column; modal closes; reopening starts clean.

- [ ] **Step 9: Report results**

Do not commit. Summarize the verification outcome for the user to review the staged files.

---

## Self-Review Notes

- **Spec coverage:** Navbar button removal (Task 4), store fields + `openAddTask`/`resetAddTask` (Task 1), quick-add expand icon + clear-on-escalate (Task 3), modal `column_id`/`title` defaults + clear-on-close (Task 2), edit-still-possible column Select (unchanged, noted), no mutation/schema/habit-tracker changes (out of scope, untouched). All covered.
- **Type consistency:** Store action names `openAddTask` / `resetAddTask` and field names `add_task_column_id` / `add_task_initial_title` are used identically across Tasks 1-3. Icon `MdOpenInFull` from `react-icons/md`. Handler `closeAddTask` (modal) and `handleOpenDetailed` (quick-add) are each defined and referenced within their own file.
- **No new tests:** Repo has no framework; verification is manual per CLAUDE.md and prior-feature precedent.
- **No commits:** Every task stages only; final step explicitly defers committing to the user.
