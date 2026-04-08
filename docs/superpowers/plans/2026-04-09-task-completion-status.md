# Task Completion Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Do NOT commit — the user will review and commit manually.**

**Goal:** Add an `isCompleted` boolean field to tasks so users can mark them as done, with auto-completion when all subtasks are finished.

**Architecture:** Add `isCompleted` to the Prisma Task model, create a new server action + mutation hook for toggling it, modify the existing subtask toggle to auto-complete the parent task when all subtasks are done, and update the task card and view modal UI.

**Tech Stack:** Prisma 7, Next.js 16 Server Actions, TanStack React Query v5, Zustand, Zod, Tailwind CSS v4, react-icons

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `prisma/schema.prisma` | Add `isCompleted` field to Task model |
| Modify | `types/index.ts` | Add `isCompleted` to Task type |
| Modify | `schema/task-schema.ts` | Add `toggle_task_complete_schema` |
| Modify | `actions/task.actions.ts` | Add `toggleTaskCompleteAction`, modify `updateSubtaskAction` |
| Modify | `actions/board.actions.ts` | Include `isCompleted` in `getBoardById` response |
| Create | `hooks/mutations/toggle-task-complete.mutation.ts` | `useToggleTaskComplete` mutation hook |
| Modify | `hooks/mutations/task.mutation.ts` | Update `useUpdateSubtask` optimistic update for auto-complete |
| Modify | `hooks/mutations/mark-all-subtasks-complete.mutation.ts` | Update optimistic update to also set `task.isCompleted = true` |
| Modify | `app/globals.css` | Add `--success` CSS variable for completed task styling |
| Modify | `components/columns/task-item.tsx` | Add checkmark toggle + completed styling |
| Modify | `components/task/view-task-modal.tsx` | Replace "Mark all as done" with task completion toggle |

---

### Task 1: Prisma Schema + Migration

**Files:**
- Modify: `prisma/schema.prisma:117-127`

- [ ] **Step 1: Add `isCompleted` field to Task model**

In `prisma/schema.prisma`, add `isCompleted` to the `Task` model after the `description` field:

```prisma
model Task {
  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title        String
  description  String?
  isCompleted  Boolean   @default(false)
  subtaskOrder String[]  @default([]) @db.Uuid
  columnId     String    @db.Uuid
  column       Column    @relation(fields: [columnId], references: [id], onDelete: Cascade)
  subtasks     Subtask[]
  createdAt    DateTime  @default(now()) @db.Timestamp(6)
  updatedAt    DateTime  @updatedAt @db.Timestamp(6)
}
```

- [ ] **Step 2: Generate Prisma client and push schema**

Run:
```bash
npx prisma db push
```
Expected: schema synced with database, `isCompleted` column added with `false` default.

Then:
```bash
npx prisma generate
```
Expected: Prisma client regenerated with `isCompleted` on `Task`.

---

### Task 2: Update App Types

**Files:**
- Modify: `types/index.ts:24-27`

- [ ] **Step 1: Add `isCompleted` to the Task type**

Change the `Task` type to include `isCompleted`:

```typescript
export type Task = Pick<PrismaTask, "id" | "title" | "isCompleted" | "subtaskOrder"> & {
	description: string;
	subtasks: Subtask[];
};
```

---

### Task 3: Update `getBoardById` to Return `isCompleted`

**Files:**
- Modify: `actions/board.actions.ts:263-273`

- [ ] **Step 1: Add `isCompleted` to the task mapping**

In `getBoardById`, update the task mapping (around line 263) to include `isCompleted`:

```typescript
tasks: sortByIdOrder(column.tasks, column.taskOrder).map((task) => ({
	id: task.id,
	title: task.title,
	isCompleted: task.isCompleted,
	description: task.description || "",
	subtaskOrder: task.subtaskOrder,
	subtasks: sortByIdOrder(task.subtasks, task.subtaskOrder).map((subtask) => ({
		id: subtask.id,
		title: subtask.title,
		isCompleted: subtask.isCompleted
	}))
}))
```

---

### Task 4: Add Zod Schema

**Files:**
- Modify: `schema/task-schema.ts`

- [ ] **Step 1: Add `toggle_task_complete_schema` and its type**

After the `mark_all_subtasks_complete_schema` (line 108), add:

```typescript
export const toggle_task_complete_schema = z.object({
	board_id: z.string(),
	column_id: z.string(),
	task_id: z.string(),
	isCompleted: z.boolean()
});

export type ToggleTaskCompleteSchemaType = z.infer<typeof toggle_task_complete_schema>;
```

---

### Task 5: Add Server Action — `toggleTaskCompleteAction`

**Files:**
- Modify: `actions/task.actions.ts`

- [ ] **Step 1: Import the new schema**

Update the schema import at the top of `actions/task.actions.ts` (line 8) to include `toggle_task_complete_schema`:

```typescript
import { add_subtask_schema, create_task_schema, delete_task_schema, edit_task_schema, mark_all_subtasks_complete_schema, MAX_SUBTASKS, reorder_subtask_schema, reorder_task_schema, toggle_task_complete_schema, update_subtask_schema, update_task_column_schema } from "@/schema/task-schema";
```

- [ ] **Step 2: Add the `toggleTaskCompleteAction` after `markAllSubtasksCompleteAction`**

At the end of the file, add:

```typescript
/**
 * DOCU: Toggles the completion status of a task. <br>
 * Triggered: On clicking the task completion toggle in the task card or view task modal. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export const toggleTaskCompleteAction = authActionClient
	.schema(toggle_task_complete_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { board_id, task_id, isCompleted } = parsedInput;

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

		await prisma.task.update({
			where: { id: task_id },
			data: { isCompleted }
		});
	});
```

---

### Task 6: Modify `updateSubtaskAction` — Auto-Complete Task

**Files:**
- Modify: `actions/task.actions.ts:226-252`

- [ ] **Step 1: Update `updateSubtaskAction` to auto-complete the task when all subtasks are done**

Replace the existing `updateSubtaskAction` with:

```typescript
/**
 * DOCU: Updates the completion status of a subtask. Auto-completes the parent task when all subtasks are done. <br>
 * Triggered: On toggling a subtask checkbox in view task modal. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export const updateSubtaskAction = authActionClient
	.schema(update_subtask_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { subtask_id, task_id, board_id, isCompleted } = parsedInput;

		/* Verify the subtask belongs to a task in a board owned by the current user */
		const subtask = await prisma.subtask.findFirst({
			where: {
				id: subtask_id,
				taskId: task_id,
				task: { column: { board: { id: board_id, userId: ctx.userId } } }
			},
			select: { id: true }
		});

		if (!subtask) {
			throw new Error("Subtask not found");
		}

		const updated_subtask = await prisma.subtask.update({
			where: { id: subtask_id },
			data: { isCompleted },
			select: { id: true, title: true, isCompleted: true }
		});

		/* Auto-complete task if all subtasks are now completed */
		if (isCompleted) {
			const incomplete_count = await prisma.subtask.count({
				where: { taskId: task_id, isCompleted: false }
			});

			if (incomplete_count === 0) {
				await prisma.task.update({
					where: { id: task_id },
					data: { isCompleted: true }
				});
			}
		}

		return updated_subtask;
	});
```

---

### Task 7: Create `useToggleTaskComplete` Mutation Hook

**Files:**
- Create: `hooks/mutations/toggle-task-complete.mutation.ts`

- [ ] **Step 1: Create the mutation hook file**

Create `hooks/mutations/toggle-task-complete.mutation.ts`:

```typescript
/* ACTIONS */
import { toggleTaskCompleteAction } from "@/actions/task.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { ToggleTaskCompleteSchemaType } from "@/schema/task-schema";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARD } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * DOCU: Will toggle the completion status of a task with optimistic updates. <br>
 * Triggered: On clicking the task completion toggle in the task card or view task modal. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export const useToggleTaskComplete = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: toggleTaskComplete, ...rest } = useMutation({
		mutationFn: (payload: ToggleTaskCompleteSchemaType) => executeAction(toggleTaskCompleteAction(payload)),
		onMutate: async (payload) => {
			await queryClient.cancelQueries({ queryKey: [...CACHE_KEY_BOARD, payload.board_id] });

			const previous_board = queryClient.getQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id]);

			queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
				if (!board) return board;

				return {
					...board,
					columns: board.columns?.map((column) => ({
						...column,
						tasks: column.id === payload.column_id
							? column.tasks?.map((task) =>
								task.id === payload.task_id
									? { ...task, isCompleted: payload.isCompleted }
									: task
							)
							: column.tasks
					}))
				};
			});

			return { previous_board };
		},
		onError: (_, payload, context) => {
			if (context?.previous_board) {
				queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], context.previous_board);
			}

			toast.error("Something went wrong. Please try again.");
		},
		onSuccess: (_, payload) => {
			toast.success(payload.isCompleted ? "Task marked as done." : "Task marked as incomplete.");
			callback?.onSuccess?.();
		}
	});

	return { toggleTaskComplete, ...rest };
};
```

---

### Task 8: Update `useUpdateSubtask` Optimistic Update — Auto-Complete

**Files:**
- Modify: `hooks/mutations/task.mutation.ts:155-206`

- [ ] **Step 1: Update the `onMutate` optimistic update to also set `task.isCompleted = true` when all subtasks are completed**

Replace the `onMutate` in `useUpdateSubtask` (lines 160-191) with:

```typescript
onMutate: async (payload) => {
	await queryClient.cancelQueries({ queryKey: [...CACHE_KEY_BOARD, payload.board_id] });

	const previous_board = queryClient.getQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id]);

	queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
		if (!board) return board;

		return {
			...board,
			columns: board.columns?.map((column) => ({
				...column,
				tasks: column.id === payload.column_id
					? column.tasks?.map((task) => {
						if (task.id !== payload.task_id) return task;

						const updated_subtasks = task.subtasks.map((subtask) =>
							subtask.id === payload.subtask_id
								? { ...subtask, isCompleted: payload.isCompleted }
								: subtask
						);

						/* Auto-complete task if all subtasks are now completed */
						const all_completed = payload.isCompleted && updated_subtasks.every((s) => s.isCompleted);

						return {
							...task,
							subtasks: updated_subtasks,
							isCompleted: all_completed ? true : task.isCompleted
						};
					})
					: column.tasks
			}))
		};
	});

	return { previous_board };
},
```

---

### Task 9: Update `useMarkAllSubtasksComplete` Optimistic Update

**Files:**
- Modify: `hooks/mutations/mark-all-subtasks-complete.mutation.ts:36-55`

- [ ] **Step 1: Update the optimistic update to also set `task.isCompleted = true`**

Replace the `queryClient.setQueryData` call in `onMutate` (lines 36-55) with:

```typescript
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
							isCompleted: true,
							subtasks: task.subtasks.map((subtask) => ({ ...subtask, isCompleted: true }))
						}
						: task
				)
				: column.tasks
		}))
	};
});
```

---

### Task 10: Update `markAllSubtasksCompleteAction` Server Action

**Files:**
- Modify: `actions/task.actions.ts:474-496`

- [ ] **Step 1: Update the action to also mark the task as completed**

Replace the Prisma call at the end of `markAllSubtasksCompleteAction` (lines 492-495) with:

```typescript
await prisma.$transaction(async (tx) => {
	await tx.subtask.updateMany({
		where: { taskId: task_id },
		data: { isCompleted: true }
	});

	await tx.task.update({
		where: { id: task_id },
		data: { isCompleted: true }
	});
});
```

---

### Task 11: Add Success Color CSS Variable

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add `--success` CSS variable to both light and dark themes**

In the `:root` block (after `--medium-grey` on line 28), add:

```css
--success: hsl(143, 64%, 40%);
```

In the `.dark` block (after `--lines` on line 52), add:

```css
--success: hsl(143, 64%, 48%);
```

- [ ] **Step 2: Add `--color-success` to the `@theme inline` block**

After `--color-lines` (around line 75), add:

```css
--color-success: var(--success);
```

---

### Task 12: Update Task Card — Completion Toggle + Styling

**Files:**
- Modify: `components/columns/task-item.tsx`

- [ ] **Step 1: Replace the entire `task-item.tsx` file**

```typescript
"use client";

/* REACT */
import { useRef, useState } from "react";

/* NEXT */
import { useParams } from "next/navigation";

/* PLUGINS */
import { useSortable } from "@dnd-kit/react/sortable";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* MUTATIONS */
import { useToggleTaskComplete } from "@/hooks/mutations/toggle-task-complete.mutation";

/* TYPES */
import { Task } from "@/types";

/* UTILITIES */
import { cn } from "@/lib/utils";

/* ICONS */
import { MdDragIndicator, MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";

interface Props {
	column_id: string;
	task: Task;
	index: number;
	disabled?: boolean;
}

const TaskItem = ({ task, column_id, index, disabled }: Props) => {
	const { board_id } = useParams() as { board_id: string };
	const setModal = useTaskStore((state) => state.setModal);
	const setSelectedTask = useTaskStore((state) => state.setSelectedTask);
	const [element, setElement] = useState<Element | null>(null);
	const handleRef = useRef<HTMLButtonElement | null>(null);
	const { toggleTaskComplete, isPending: is_toggling } = useToggleTaskComplete();
	const { isDragging } = useSortable({
		id: task.id,
		index,
		element,
		handle: handleRef,
		type: "task",
		accept: "task",
		group: column_id,
		disabled
	});

	/**
	 * DOCU: Toggles the completion status of the task. <br>
	 * Triggered: On clicking the checkmark button on the task card. <br>
	 * Last Updated: April 09, 2026
	 * @author Jhones
	 */
	const onToggleComplete = (event: React.MouseEvent) => {
		event.stopPropagation();
		toggleTaskComplete({
			board_id,
			column_id,
			task_id: task.id,
			isCompleted: !task.isCompleted
		});
	};

	return (
		<div key={task.id} ref={setElement} className={cn(
			"bg-foreground rounded-lg flex items-center drop-shadow-md px-[16] py-[24] group transition-opacity",
			isDragging && "border-dashed border-2 border-primary !bg-transparent",
			disabled && "opacity-50 pointer-events-none",
			task.isCompleted && "border border-success/30 bg-success/5"
		)}>
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

			<button
				className={cn("group flex cursor-pointer flex-col gap-[8] text-left flex-1", isDragging && "opacity-0")}
				type="button"
				onClick={() => {
					setModal("view_task", true);
					setSelectedTask(task.id, column_id);
				}}
			>
				<p className={cn(
					"text-h-md group-hover:text-primary dark:group-hover:text-primary text-black dark:text-white",
					task.isCompleted && "line-through opacity-50"
				)}>{task.title}</p>
				{task?.subtasks?.length > 0 && (
					<p className="text-b-md text-medium-grey">
						{task?.subtasks.filter((subtask) => subtask.isCompleted).length} of {task?.subtasks?.length} subtasks
					</p>
				)}
			</button>

			<button ref={handleRef} type="button" className={cn("cursor-grab text-primary/70 transition-opacity", isDragging ? "opacity-0" : "opacity-100 group-hover:opacity-100")}>
				<MdDragIndicator size={20} />
			</button>
		</div>
	);
};

export default TaskItem;
```

---

### Task 13: Update View Task Modal — Task Completion Toggle

**Files:**
- Modify: `components/task/view-task-modal.tsx`

- [ ] **Step 1: Add the mutation import**

Add after the existing mutations import (line 34):

```typescript
import { useToggleTaskComplete } from "@/hooks/mutations/toggle-task-complete.mutation";
```

- [ ] **Step 2: Add the mutation hook call**

Inside `ViewTaskModal`, after the `useMarkAllSubtasksComplete` line (line 60), add:

```typescript
const { toggleTaskComplete, isPending: is_toggling_complete } = useToggleTaskComplete();
```

- [ ] **Step 3: Add the toggle handler function**

After the `onToggleSubtask` function (after line 99), add:

```typescript
/**
 * DOCU: Toggles the completion status of the task. <br>
 * Triggered: On clicking the mark as done/incomplete button in the view task modal. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
const onToggleTaskComplete = () => {
	if (selected_task) {
		toggleTaskComplete({
			board_id,
			column_id: selected_task.column_id,
			task_id: selected_task.id,
			isCompleted: !selected_task.isCompleted
		});
	}
};
```

- [ ] **Step 4: Add `MdCheckCircle` to the icons import**

Update the icons import (line 47) to:

```typescript
import { MdDragIndicator, MdCheckBox, MdCheckCircle } from "react-icons/md";
```

- [ ] **Step 5: Add completion indicator to the title area**

Replace the title `<div>` (lines 157-168) with:

```typescript
<div className="flex">
	<div className="flex-1 flex items-start gap-[12]">
		{selected_task?.isCompleted && (
			<span className="text-success mt-[4]">
				<MdCheckCircle size={20} />
			</span>
		)}
		<DialogTitle className={cn("text-h-lg flex-1", selected_task?.isCompleted && "line-through opacity-50")}>{selected_task?.title}</DialogTitle>
	</div>
	<ActionOptions
		name="Task"
		onDeleteClick={() => {
			setModal("delete_task", true);
		}}
		onEditClick={() => {
			setModal("edit_task", true);
		}}
	/>
</div>
```

- [ ] **Step 6: Replace the "Mark all as done" button with a task completion toggle**

Replace the "Mark all as done" button block (lines 241-257) with:

```typescript
{selected_task && (
	<button
		type="button"
		className={cn(
			"flex items-center h-[32] gap-[8] w-fit t-[13] font-bold mt-[8] cursor-pointer disabled:opacity-50",
			selected_task.isCompleted ? "text-medium-grey" : "text-success"
		)}
		disabled={is_toggling_complete || is_updating_subtask || is_reordering}
		onClick={onToggleTaskComplete}
	>
		<MdCheckCircle size={16} />
		{selected_task.isCompleted ? "Mark as incomplete" : "Mark as done"}
	</button>
)}
```

---

### Task 14: Update Existing Mutations That Set Task Data in Cache

**Files:**
- Modify: `hooks/mutations/task.mutation.ts`

- [ ] **Step 1: Update `useCreateTask` to include `isCompleted` in the cache update**

In `useCreateTask`, the `onSuccess` handler (line 43) spreads `response` into the task list. The server action `createTaskAction` returns `{ id, title, description, subtaskOrder, subtasks }` — it needs to also return `isCompleted`.

Update `createTaskAction` in `actions/task.actions.ts` (around line 77-84) to include `isCompleted` in the return:

```typescript
return {
	id: task.id,
	title: task.title,
	isCompleted: task.isCompleted,
	description: task.description || "",
	subtaskOrder: subtask_ids,
	subtasks
};
```

- [ ] **Step 2: Update `useEditTask` to preserve `isCompleted` in the cache update**

In `useEditTask`, the `onSuccess` handler (lines 83-91) rebuilds the task object but doesn't include `isCompleted`. Update the task mapping to preserve it:

```typescript
tasks: column.tasks?.map((task) =>
	task.id === payload.id
		? {
			id: response.id,
			title: response.title,
			isCompleted: task.isCompleted,
			description: response.description,
			subtaskOrder: response.subtaskOrder,
			subtasks: response.subtasks
		}
		: task
)
```

---

### Task 15: Verify

- [ ] **Step 1: Run Prisma generate to confirm no schema errors**

Run:
```bash
npx prisma generate
```
Expected: No errors.

- [ ] **Step 2: Run the dev server and verify the build**

Run:
```bash
npm run build
```
Expected: No TypeScript errors or build failures.

- [ ] **Step 3: Manual testing checklist**

1. Open a board — task cards should show a circle checkmark button on the left
2. Click the checkmark on a task with no subtasks — card should get green border/bg, title strikes through, checkmark fills green
3. Click again — card reverts to normal styling
4. Open a task via the view modal — "Mark as done" button should appear below the subtasks
5. Click "Mark as done" — title gets checkmark icon + strikethrough, button changes to "Mark as incomplete"
6. Check a subtask that isn't the last one — task should NOT auto-complete
7. Check the last remaining subtask — task should auto-complete (card turns green)
8. Uncheck a subtask on a completed task — task should stay completed
9. Create a new task — it should default to not completed
10. Edit a task — `isCompleted` state should be preserved
