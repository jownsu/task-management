# Quick Add Task Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an inline input at the bottom of each column to quickly create tasks by typing a title and pressing Enter.

**Architecture:** A new `QuickAddTask` client component placed inside `ColumnItem` after the task list. It uses a simple `useState` for the input value and the existing `useCreateTask` mutation hook to create tasks with just a title (no description, no subtasks). The `board_id` is obtained via `useParams()` inside the component, matching the pattern used in `ColumnList`.

**Tech Stack:** React 19, TanStack React Query v5 (via existing mutation hook), Next.js useParams

---

### Task 1: Create the QuickAddTask Component

**Files:**
- Create: `components/columns/quick-add-task.tsx`

- [ ] **Step 1: Create the component file**

Create `components/columns/quick-add-task.tsx` with the full implementation:

```tsx
"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useRef, useState } from "react";

/* PLUGINS */
import { IoMdAdd } from "react-icons/io";

/* MUTATIONS */
import { useCreateTask } from "@/hooks/mutations/task.mutation";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	column_id: string;
}

/**
 * DOCU: Inline input at the bottom of a column for quickly adding a task by title. <br>
 * Triggered: Rendered inside each ColumnItem below the task list. <br>
 * Last Updated: April 07, 2026
 * @author Jhones
 */
const QuickAddTask = ({ column_id }: Props) => {
	const { board_id } = useParams() as { board_id: string };
	const [title, setTitle] = useState("");
	const [is_active, setIsActive] = useState(false);
	const input_ref = useRef<HTMLInputElement>(null);

	const { createTask, isPending } = useCreateTask({
		onSuccess: () => {
			setTitle("");
			input_ref.current?.focus();
		}
	});

	/**
	 * DOCU: Submits the quick-add task form if the title is not empty. <br>
	 * Triggered: On Enter key press or clicking the add button. <br>
	 * Last Updated: April 07, 2026
	 * @author Jhones
	 */
	const handleSubmit = () => {
		const trimmed = title.trim();
		if (!trimmed || isPending) return;

		createTask({
			title: trimmed,
			column_id,
			board_id,
			sub_tasks: []
		});
	};

	/**
	 * DOCU: Handles keyboard events for the quick-add input. <br>
	 * Triggered: On keydown in the quick-add input field. <br>
	 * Last Updated: April 07, 2026
	 * @author Jhones
	 */
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		}
		if (e.key === "Escape") {
			setTitle("");
			setIsActive(false);
			input_ref.current?.blur();
		}
	};

	if (!is_active) {
		return (
			<button
				type="button"
				onClick={() => {
					setIsActive(true);
					setTimeout(() => input_ref.current?.focus(), 0);
				}}
				className="flex items-center gap-[4] rounded-lg px-[16] py-[8] text-medium-grey text-b-lg cursor-pointer hover:text-primary transition-colors"
			>
				<IoMdAdd size={16} />
				<span>Add Task</span>
			</button>
		);
	}

	return (
		<div className="bg-foreground rounded-lg drop-shadow-md px-[16] py-[12] flex items-center gap-[8]">
			<input
				ref={input_ref}
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={() => {
					if (!title.trim()) {
						setIsActive(false);
					}
				}}
				placeholder="Task name"
				disabled={isPending}
				className={cn(
					"flex-1 bg-transparent text-h-md text-black dark:text-white placeholder:text-black/25 dark:placeholder:text-white/25 outline-none disabled:opacity-50"
				)}
			/>
			<button
				type="button"
				onClick={handleSubmit}
				disabled={!title.trim() || isPending}
				className="text-primary hover:text-primary/80 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-opacity"
			>
				<IoMdAdd size={20} />
			</button>
		</div>
	);
};

export default QuickAddTask;
```

**Design decisions:**
- Two states: inactive (shows "Add Task" button) and active (shows inline input). This keeps the column clean when not adding tasks.
- Uses `useParams()` to get `board_id` — same pattern as `ColumnList` — avoids needing to thread `board_id` through props.
- `onSuccess` clears input and re-focuses for rapid task entry.
- Escape key cancels and deactivates. Blur deactivates when input is empty.
- Uses `IoMdAdd` from `react-icons` (project convention: use `react-icons` for custom components).
- Styling matches TaskItem: `bg-foreground rounded-lg drop-shadow-md px-[16]`.
- No form element needed — submit is on Enter keydown and button click.

- [ ] **Step 2: Verify the component renders without errors**

Run: `npm run build`
Expected: Build succeeds with no type errors.

- [ ] **Step 3: Commit**

```bash
git add components/columns/quick-add-task.tsx
git commit -m "feat: add QuickAddTask component for inline task creation"
```

---

### Task 2: Integrate QuickAddTask into ColumnItem

**Files:**
- Modify: `components/columns/column-item.tsx`

- [ ] **Step 1: Add QuickAddTask to ColumnItem**

In `components/columns/column-item.tsx`, add the import after the existing TaskItem import:

```tsx
import QuickAddTask from "@/components/columns/quick-add-task";
```

Then add `<QuickAddTask />` inside the droppable div, after the task map:

Replace the droppable div section (lines 37-50):

```tsx
<div 
	ref={ref}
	className={cn("flex flex-col gap-[20] min-h-full h-full rounded-lg")} 
>
	{column?.tasks?.map((task, index) => (
		<TaskItem
			key={task.id}
			task={task}
			column_id={column.id}
			index={index}
			disabled={is_reordering}
		/>
	))}
	<QuickAddTask column_id={column.id} />
</div>
```

The only change is adding the import and the `<QuickAddTask column_id={column.id} />` line after the task map.

- [ ] **Step 2: Verify the integration works**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Manual test**

Run: `npm run dev`

Test the following:
1. Each column shows an "Add Task" button at the bottom of the task list.
2. Clicking "Add Task" reveals an inline input.
3. Typing a task name and pressing Enter creates the task (appears in the column immediately via cache update, toast shows "Task created successfully.").
4. Input clears and stays focused after creation for rapid entry.
5. Pressing Escape clears input and reverts to the "Add Task" button.
6. Clicking away (blur) with empty input reverts to the "Add Task" button.
7. The add button is disabled while a task is being created (pending state).
8. Drag-and-drop of existing tasks still works correctly.

- [ ] **Step 4: Commit**

```bash
git add components/columns/column-item.tsx
git commit -m "feat: integrate QuickAddTask input into column items"
```
