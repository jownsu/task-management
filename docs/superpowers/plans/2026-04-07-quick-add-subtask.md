# Quick Add Subtask Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an inline input inside the view-task modal to quickly add subtasks by typing a title and pressing Enter, matching the quick-add-task pattern.

**Architecture:** A new `addSubtaskAction` server action creates a single subtask and appends it to the task's `subtaskOrder`. A new `useAddSubtask` mutation hook handles cache updates. A new `QuickAddSubtask` component (same UI pattern as `QuickAddTask`) is rendered inside the view-task modal after the subtask list.

**Tech Stack:** Next.js Server Actions, Prisma 7, TanStack React Query v5, next-safe-action, Zod, React 19

---

### Task 1: Add Zod Schema for Creating a Single Subtask

**Files:**
- Modify: `schema/task-schema.ts`

- [ ] **Step 1: Add the schema and type export**

In `schema/task-schema.ts`, add the following after the `reorder_subtask_schema` block (after line 93):

```typescript
export const add_subtask_schema = z.object({
	board_id: z.string(),
	column_id: z.string(),
	task_id: z.string(),
	title: z.string().min(1, "Title is required")
});

export type AddSubtaskSchemaType = z.infer<typeof add_subtask_schema>;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add schema/task-schema.ts
git commit -m "feat: add Zod schema for creating a single subtask"
```

---

### Task 2: Add Server Action for Creating a Single Subtask

**Files:**
- Modify: `actions/task.actions.ts`

- [ ] **Step 1: Update the schema import**

In `actions/task.actions.ts`, update the import on line 8 to include `add_subtask_schema`:

```typescript
import { add_subtask_schema, create_task_schema, delete_task_schema, edit_task_schema, reorder_subtask_schema, reorder_task_schema, update_subtask_schema, update_task_column_schema } from "@/schema/task-schema";
```

- [ ] **Step 2: Add the server action**

Add the following after the `reorderSubtaskAction` (after line 413):

```typescript
/**
 * DOCU: Creates a single subtask and appends it to the task's subtaskOrder. <br>
 * Triggered: On submission of quick-add subtask input in view task modal. <br>
 * Last Updated: April 07, 2026
 * @author Jhones
 */
export const addSubtaskAction = authActionClient
	.schema(add_subtask_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { board_id, task_id, title } = parsedInput;

		/* Verify the task belongs to a board owned by the current user */
		const task = await prisma.task.findFirst({
			where: {
				id: task_id,
				column: { board: { id: board_id, userId: ctx.userId } }
			},
			select: { id: true }
		});

		if (!task) {
			throw new Error("Task not found");
		}

		const result = await prisma.$transaction(async (tx) => {
			/* Create the subtask */
			const subtask = await tx.subtask.create({
				data: {
					title,
					taskId: task_id
				}
			});

			/* Append to the task's subtaskOrder */
			await tx.task.update({
				where: { id: task_id },
				data: { subtaskOrder: { push: subtask.id } }
			});

			return {
				id: subtask.id,
				title: subtask.title,
				isCompleted: subtask.isCompleted
			};
		});

		return result;
	});
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add actions/task.actions.ts schema/task-schema.ts
git commit -m "feat: add server action for creating a single subtask"
```

---

### Task 3: Add Mutation Hook for Adding a Subtask

**Files:**
- Modify: `hooks/mutations/task.mutation.ts`

- [ ] **Step 1: Update imports**

In `hooks/mutations/task.mutation.ts`, update the action import on line 2 to include `addSubtaskAction`:

```typescript
import { addSubtaskAction, createTaskAction, deleteTaskAction, editTaskAction, reorderSubtaskAction, reorderTaskAction, updateSubtaskAction, updateTaskColumnAction } from "@/actions/task.actions";
```

Update the schema import on line 8 to include `AddSubtaskSchemaType`:

```typescript
import { AddSubtaskSchemaType, CreateTaskSchemaType, DeleteTaskSchemaType, EditTaskSchemaType, ReorderSubtaskSchemaType, ReorderTaskSchemaType, UpdateSubtaskSchemaType, UpdateTaskColumnSchemaType } from "@/schema/task-schema";
```

- [ ] **Step 2: Add the mutation hook**

Add the following after the `useReorderSubtask` hook (after line 403):

```typescript
/**
 * DOCU: Will add a single subtask to an existing task. <br>
 * Triggered: On submission of quick-add subtask input in view task modal. <br>
 * Last Updated: April 07, 2026
 * @author Jhones
 */
export const useAddSubtask = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: addSubtask, ...rest } = useMutation({
		mutationFn: (payload: AddSubtaskSchemaType) => executeAction(addSubtaskAction(payload)),
		onSuccess: (response, payload) => {
			if (response) {
				queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
					if (!board) return board;

					return {
						...board,
						columns: board.columns?.map((column) => ({
							...column,
							tasks: column.id === payload.column_id
								? column.tasks?.map((task) =>
									task.id === payload.task_id
										? {
											...task,
											subtaskOrder: [...task.subtaskOrder, response.id],
											subtasks: [...task.subtasks, response]
										}
										: task
								)
								: column.tasks
						}))
					};
				});
			}

			toast.success("Subtask added successfully.");
			callback?.onSuccess?.();
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		}
	});

	return { addSubtask, ...rest };
};
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add hooks/mutations/task.mutation.ts
git commit -m "feat: add useAddSubtask mutation hook"
```

---

### Task 4: Create QuickAddSubtask Component

**Files:**
- Create: `components/task/quick-add-subtask.tsx`

- [ ] **Step 1: Create the component file**

Create `components/task/quick-add-subtask.tsx`:

```tsx
"use client";

/* REACT */
import { useRef, useState } from "react";

/* PLUGINS */
import { IoMdAdd } from "react-icons/io";

/* MUTATIONS */
import { useAddSubtask } from "@/hooks/mutations/task.mutation";

interface Props {
	board_id: string;
	column_id: string;
	task_id: string;
}

/**
 * DOCU: Inline input for quickly adding a subtask by title inside the view task modal. <br>
 * Triggered: Rendered inside ViewTaskModal below the subtask list. <br>
 * Last Updated: April 07, 2026
 * @author Jhones
 */
const QuickAddSubtask = ({ board_id, column_id, task_id }: Props) => {
	const [title, setTitle] = useState("");
	const input_ref = useRef<HTMLInputElement>(null);

	const { addSubtask, isPending } = useAddSubtask({
		onSuccess: () => {
			setTitle("");
			input_ref.current?.focus();
		}
	});

	/**
	 * DOCU: Submits the quick-add subtask form if the title is not empty. <br>
	 * Triggered: On Enter key press or clicking the add button. <br>
	 * Last Updated: April 07, 2026
	 * @author Jhones
	 */
	const handleSubmit = () => {
		const trimmed = title.trim();
		if (!trimmed || isPending) return;

		addSubtask({
			title: trimmed,
			board_id,
			column_id,
			task_id
		});
	};

	/**
	 * DOCU: Handles keyboard events for the quick-add subtask input. <br>
	 * Triggered: On keydown in the quick-add subtask input field. <br>
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
			input_ref.current?.blur();
		}
	};

	return (
		<div className="bg-background rounded-md px-[12] py-[12] flex items-center gap-[8]">
			<input
				ref={input_ref}
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="+ Add New Subtask"
				disabled={isPending}
				className="flex-1 bg-transparent text-b-lg font-bold text-black dark:text-white placeholder:text-black/25 dark:placeholder:text-white/25 outline-none disabled:opacity-50"
			/>
			<button
				type="button"
				onClick={handleSubmit}
				disabled={!title.trim() || isPending}
				aria-label="Add subtask"
				className="text-primary hover:text-primary/80 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-opacity"
			>
				<IoMdAdd size={18} />
			</button>
		</div>
	);
};

export default QuickAddSubtask;
```

**Design decisions:**
- Uses `bg-background rounded-md px-[12] py-[12]` to match the existing subtask item styling (`px-[12] py-[16] bg-background` at view-task-modal.tsx line 181).
- Uses `text-b-lg font-bold` to match subtask text styling (`t-[12] font-bold` at view-task-modal.tsx line 198).
- Props receive `board_id`, `column_id`, `task_id` from the parent (view-task modal already has all three).
- Same keyboard interaction pattern as `QuickAddTask`: Enter submits, Escape clears.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/task/quick-add-subtask.tsx
git commit -m "feat: add QuickAddSubtask component for inline subtask creation"
```

---

### Task 5: Integrate QuickAddSubtask into ViewTaskModal

**Files:**
- Modify: `components/task/view-task-modal.tsx`

- [ ] **Step 1: Add the import**

In `components/task/view-task-modal.tsx`, add after the existing `SortableSubtaskField` import (line 16):

```tsx
import QuickAddSubtask from "@/components/task/quick-add-subtask";
```

- [ ] **Step 2: Add the MAX_SUBTASKS import**

Add after the existing imports, in a `/* CONSTANTS */` section (after the `/* UTILITIES */` section):

```tsx
/* CONSTANTS */
import { MAX_SUBTASKS } from "@/schema/task-schema";
```

- [ ] **Step 3: Add QuickAddSubtask inside the subtasks section**

In the view-task-modal, find the subtask list section (around line 174). The current code is:

```tsx
{subtasks.length > 0 && <div className="grid gap-4">
	<label className="text-medium-grey t-[12] font-bold leading-none">Subtasks ({subtasks.filter(subtask => subtask.isCompleted).length}/{subtasks.length})</label>
	<DragDropProvider ...>
		...
	</DragDropProvider>
</div>}
```

Replace that entire block (lines 174-233) with:

```tsx
<div className="grid gap-4">
	{subtasks.length > 0 && (
		<>
			<label className="text-medium-grey t-[12] font-bold leading-none">Subtasks ({subtasks.filter(subtask => subtask.isCompleted).length}/{subtasks.length})</label>
			<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<div className="flex flex-col gap-2">
					{subtasks.map((subtask, index) => (
						<SortableSubtaskField key={subtask.id} id={subtask.id} index={index} disabled={is_updating_subtask || is_reordering}>
							<label
								className={cn("px-[12] py-[16] bg-background flex gap-[16] cursor-pointer flex-1 min-w-0", { "pointer-events-none opacity-50": is_updating_subtask || is_reordering })}
								tabIndex={0}
								aria-label={subtask.title}
								onClick={(event) => {
									event.preventDefault();
									event.stopPropagation();
									onToggleSubtask(subtask.id, subtask.isCompleted);
								}}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										onToggleSubtask(subtask.id, subtask.isCompleted);
									}
								}}
							>
								<Checkbox checked={subtask.isCompleted} />
								<span
									className={cn("t-[12] font-bold dark:text-white", {
										["line-through opacity-50"]: subtask.isCompleted,
									})}
								>
									{subtask.title}
								</span>
							</label>
						</SortableSubtaskField>
					))}
				</div>
				<DragOverlay dropAnimation={null}>
					{(source) => {
						const subtask = subtasks.find((s) => s.id === source.id);
						if (!subtask) return null;

						return (
							<div className="flex items-center rounded-md bg-foreground drop-shadow-md">
								<span className="text-primary -translate-x-0.5">
									<MdDragIndicator size={16} />
								</span>
								<div className="px-[12] py-[16] bg-background flex gap-[16] flex-1 min-w-0">
									<Checkbox checked={subtask.isCompleted} />
									<span
										className={cn("t-[12] font-bold dark:text-white", {
											["line-through opacity-50"]: subtask.isCompleted,
										})}
									>
										{subtask.title}
									</span>
								</div>
							</div>
						);
					}}
				</DragOverlay>
			</DragDropProvider>
		</>
	)}
	{selected_task && subtasks.length < MAX_SUBTASKS && (
		<QuickAddSubtask
			board_id={board_id}
			column_id={selected_task.column_id}
			task_id={selected_task.id}
		/>
	)}
</div>
```

**Key changes from original:**
1. The outer `<div className="grid gap-4">` is now always rendered (not gated by `subtasks.length > 0`), so the quick-add input shows even when there are no subtasks yet.
2. The subtask list + DragDrop is wrapped in a fragment and gated by `subtasks.length > 0`.
3. `QuickAddSubtask` is rendered at the bottom, hidden when subtask count reaches `MAX_SUBTASKS` (10).

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Manual test**

Run: `npm run dev`

Test the following:
1. Open a task via the view-task modal.
2. The quick-add subtask input appears below the subtask list (or alone if no subtasks exist).
3. Type a subtask title and press Enter — subtask appears in the list, toast shows "Subtask added successfully."
4. Input clears and stays focused for rapid entry.
5. Pressing Escape clears the input.
6. The input disappears when 10 subtasks exist (MAX_SUBTASKS limit).
7. Existing subtask features still work: toggling completion, reordering via drag-and-drop.
8. Opening a different task resets the input.

- [ ] **Step 6: Commit**

```bash
git add components/task/view-task-modal.tsx
git commit -m "feat: integrate QuickAddSubtask input into view task modal"
```
