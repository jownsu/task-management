# Subtask Reordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add drag-and-drop reordering of subtasks in view-task-modal (live persist) and edit-task-modal (form-based).

**Architecture:** A shared `SortableSubtaskField` wrapper (mirroring `SortableColumnField`) wraps subtask items in both modals. The view-task-modal uses local state + an immediate server mutation (like `boards-list.tsx`). The edit-task-modal uses sorted keys + `useFieldArray` replace (like `create-board-modal.tsx`). Both have `DragOverlay` with dashed border styling.

**Tech Stack:** @dnd-kit/react, @dnd-kit/helpers, React Hook Form useFieldArray, Zustand, TanStack React Query, Prisma, Zod, next-safe-action

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `components/task/sortable-subtask-field.tsx` | Reusable drag-handle wrapper for subtask items |
| Modify | `schema/task-schema.ts` | Add `reorder_subtask_schema` + exported type |
| Modify | `actions/task.actions.ts` | Add `reorderSubtaskAction` server action |
| Modify | `hooks/mutations/task.mutation.ts` | Add `useReorderSubtask` mutation hook |
| Modify | `components/task/view-task-modal.tsx` | DnD reordering with live persist |
| Modify | `components/task/edit-task-modal.tsx` | DnD reordering within form fields |

---

### Task 1: Create SortableSubtaskField Component

**Files:**
- Create: `components/task/sortable-subtask-field.tsx`

- [ ] **Step 1: Create the sortable wrapper component**

Create `components/task/sortable-subtask-field.tsx` — identical structure to `components/board/sortable-column-field.tsx`, but with `type: "subtask-field"`, `accept: "subtask-field"`, `group: "subtasks"`:

```tsx
"use client";

/* REACT */
import { useRef, useState } from "react";

/* PLUGINS */
import { useSortable } from "@dnd-kit/react/sortable";

/* ICONS */
import { MdDragIndicator } from "react-icons/md";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	id: string;
	index: number;
	children: React.ReactNode;
	disabled?: boolean;
}

/**
 * DOCU: Wraps a subtask item with drag-and-drop sortable functionality and a drag handle. <br>
 * Triggered: When rendering subtask items in view/edit task modals. <br>
 * Last Updated: April 05, 2026
 * @author Jhones
 */
const SortableSubtaskField = ({ id, index, children, disabled }: Props) => {
	const [element, setElement] = useState<Element | null>(null);
	const handle_ref = useRef<HTMLButtonElement | null>(null);

	const { isDragging } = useSortable({
		id,
		index,
		element,
		handle: handle_ref,
		type: "subtask-field",
		accept: "subtask-field",
		group: "subtasks",
		disabled
	});

	return (
		<div ref={setElement} className={cn("flex items-center rounded-md", isDragging && "border-dashed border-2 border-primary !bg-transparent")}>
			<button ref={handle_ref} type="button" className={cn("cursor-grab text-primary duration-200 -translate-x-0.5", isDragging && "opacity-0", disabled && "cursor-not-allowed")}>
				<MdDragIndicator size={16} />
			</button>
			<div className={cn("flex items-center flex-1 min-w-0", isDragging && "opacity-0")}>
				{children}
			</div>
		</div>
	);
};

export default SortableSubtaskField;
```

---

### Task 2: Add Reorder Subtask Schema

**Files:**
- Modify: `schema/task-schema.ts`

- [ ] **Step 1: Add the reorder_subtask_schema and its type export**

In `schema/task-schema.ts`, add the following after the existing `reorder_task_schema` (around line 83):

```typescript
export const reorder_subtask_schema = z.object({
	board_id: z.string(),
	column_id: z.string(),
	task_id: z.string(),
	updated_subtask_order: z.array(z.string())
});

export type ReorderSubtaskSchemaType = z.infer<typeof reorder_subtask_schema>;
```

---

### Task 3: Add reorderSubtaskAction Server Action

**Files:**
- Modify: `actions/task.actions.ts`

- [ ] **Step 1: Add the import for the new schema**

In `actions/task.actions.ts`, update the schema import (line 8) to include `reorder_subtask_schema`:

Change:
```typescript
import { create_task_schema, delete_task_schema, edit_task_schema, reorder_task_schema, update_subtask_schema, update_task_column_schema } from "@/schema/task-schema";
```

To:
```typescript
import { create_task_schema, delete_task_schema, edit_task_schema, reorder_subtask_schema, reorder_task_schema, update_subtask_schema, update_task_column_schema } from "@/schema/task-schema";
```

- [ ] **Step 2: Add the reorderSubtaskAction at the end of the file**

Append after the existing `reorderTaskAction` (after line 384):

```typescript
/**
 * DOCU: Reorders subtasks within a task by updating the subtaskOrder array. <br>
 * Triggered: When a subtask is dropped after dragging in the view task modal. <br>
 * Last Updated: April 05, 2026
 * @author Jhones
 */
export const reorderSubtaskAction = authActionClient
	.schema(reorder_subtask_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { board_id, task_id, updated_subtask_order } = parsedInput;

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
			data: { subtaskOrder: updated_subtask_order }
		});
	});
```

---

### Task 4: Add useReorderSubtask Mutation Hook

**Files:**
- Modify: `hooks/mutations/task.mutation.ts`

- [ ] **Step 1: Add imports for the new action and schema type**

In `hooks/mutations/task.mutation.ts`, update the actions import (line 2) to include `reorderSubtaskAction`:

Change:
```typescript
import { createTaskAction, deleteTaskAction, editTaskAction, reorderTaskAction, updateSubtaskAction, updateTaskColumnAction } from "@/actions/task.actions";
```

To:
```typescript
import { createTaskAction, deleteTaskAction, editTaskAction, reorderSubtaskAction, reorderTaskAction, updateSubtaskAction, updateTaskColumnAction } from "@/actions/task.actions";
```

Update the schema import (line 8) to include `ReorderSubtaskSchemaType`:

Change:
```typescript
import { CreateTaskSchemaType, DeleteTaskSchemaType, EditTaskSchemaType, ReorderTaskSchemaType, UpdateSubtaskSchemaType, UpdateTaskColumnSchemaType } from "@/schema/task-schema";
```

To:
```typescript
import { CreateTaskSchemaType, DeleteTaskSchemaType, EditTaskSchemaType, ReorderSubtaskSchemaType, ReorderTaskSchemaType, UpdateSubtaskSchemaType, UpdateTaskColumnSchemaType } from "@/schema/task-schema";
```

Also add `Subtask` to the types import (line 11):

Change:
```typescript
import { Board, CallbackResponse, Task } from "@/types";
```

To:
```typescript
import { Board, CallbackResponse, Subtask, Task } from "@/types";
```

- [ ] **Step 2: Add the useReorderSubtask hook**

Add after the existing `useReorderTask` hook (after line 345):

```typescript
/**
 * DOCU: Will reorder subtasks within a task via drag and drop. <br>
 * Triggered: When a subtask is dropped after dragging in the view task modal. <br>
 * Last Updated: April 05, 2026
 * @author Jhones
 */
export const useReorderSubtask = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: reorderSubtask, ...rest } = useMutation({
		mutationFn: (payload: ReorderSubtaskSchemaType) => executeAction(reorderSubtaskAction(payload)),
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

								const subtask_map = new Map(task.subtasks.map((s) => [s.id, s]));
								const reordered_subtasks = payload.updated_subtask_order.map((id) => subtask_map.get(id)).filter(Boolean) as Subtask[];

								return { ...task, subtaskOrder: payload.updated_subtask_order, subtasks: reordered_subtasks };
							})
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
			callback?.onError?.();
		},
		onSuccess: () => {
			callback?.onSuccess?.();
		}
	});

	return { reorderSubtask, ...rest };
};
```

---

### Task 5: Add DnD Reordering to view-task-modal

**Files:**
- Modify: `components/task/view-task-modal.tsx`

- [ ] **Step 1: Add new imports**

Replace the imports section of `components/task/view-task-modal.tsx` with:

```tsx
"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useEffect, useRef, useState } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ActionOptions from "@/components/actions-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import SortableSubtaskField from "@/components/task/sortable-subtask-field";

/* PLUGINS */
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* HOOKS */
import { useSelectedTask } from "@/hooks/use-selected-task";

/* MUTATIONS */
import { useUpdateSubtask, useUpdateTaskColumn, useReorderSubtask } from "@/hooks/mutations/task.mutation";

/* TYPES */
import { Subtask } from "@/types";

/* UTILITIES */
import { cn } from "@/lib/utils";

/* ICONS */
import { MdDragIndicator } from "react-icons/md";
```

- [ ] **Step 2: Add local state, snapshot ref, useEffect sync, and reorder mutation**

Inside the `ViewTaskModal` component, after the existing hooks (after line 39 `const { updateTaskColumn } = useUpdateTaskColumn();`), add:

```tsx
const { reorderSubtask, isPending: is_reordering } = useReorderSubtask();
const [subtasks, setSubtasks] = useState<Subtask[]>(selected_task?.subtasks ?? []);
const subtasks_snapshot_ref = useRef<Subtask[]>([]);

useEffect(() => {
	setSubtasks(selected_task?.subtasks ?? []);
}, [selected_task?.subtasks]);
```

And remove the existing line:
```tsx
const sub_tasks = selected_task?.subtasks ?? [];
```

- [ ] **Step 3: Add drag event handlers**

After the existing `onToggleSubtask` function, add the three drag handlers:

```tsx
/**
 * DOCU: Captures the current subtasks state before dragging starts for rollback on cancel. <br>
 * Triggered: When a subtask item starts being dragged. <br>
 * Last Updated: April 05, 2026
 * @author Jhones
 */
const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
	subtasks_snapshot_ref.current = subtasks;
};

/**
 * DOCU: Handles the drag over event to optimistically reorder subtasks. <br>
 * Triggered: When a dragged subtask is hovering over another subtask. <br>
 * Last Updated: April 05, 2026
 * @author Jhones
 */
const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = (event) => {
	setSubtasks((prev) => move(prev, event));
};

/**
 * DOCU: Persists the subtask reorder to the server on drag end, or reverts on cancel. <br>
 * Triggered: When a dragged subtask is dropped after dragging. <br>
 * Last Updated: April 05, 2026
 * @author Jhones
 */
const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = (event) => {
	if (event.canceled) {
		setSubtasks(subtasks_snapshot_ref.current);
		return;
	}

	const updated_subtask_order = subtasks.map((s) => s.id);
	const snapshot_order = subtasks_snapshot_ref.current.map((s) => s.id);

	if (JSON.stringify(snapshot_order) === JSON.stringify(updated_subtask_order)) {
		return;
	}

	if (selected_task) {
		reorderSubtask({
			board_id,
			column_id: selected_task.column_id,
			task_id: selected_task.id,
			updated_subtask_order
		});
	}
};
```

- [ ] **Step 4: Replace the subtasks JSX section**

Replace the entire subtasks `<div className="grid gap-4">` block (lines 98–130) with the DnD-enabled version:

```tsx
<div className="grid gap-4">
	<label className="text-medium-grey t-[12] font-bold leading-none">Subtasks ({subtasks.filter(subtask => subtask.isCompleted).length}/{subtasks.length})</label>
	<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
		<div className="flex flex-col gap-2">
			{subtasks.map((subtask, index) => (
				<SortableSubtaskField key={subtask.id} id={subtask.id} index={index} disabled={is_updating_subtask || is_reordering}>
					<label
						className={cn("px-[12] py-[16] bg-background flex gap-[16] cursor-pointer flex-1 min-w-0", { "pointer-events-none opacity-50": is_updating_subtask })}
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
</div>
```

---

### Task 6: Add DnD Reordering to edit-task-modal

**Files:**
- Modify: `components/task/edit-task-modal.tsx`

- [ ] **Step 1: Add new imports**

Replace the imports section of `components/task/edit-task-modal.tsx` with:

```tsx
"use client";

/* REACT */
import { useEffect, useRef, useState } from "react";

/* NEXT */
import { useParams } from "next/navigation";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SortableSubtaskField from "@/components/task/sortable-subtask-field";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";

/* MUTATIONS */
import { useEditTask } from "@/hooks/mutations/task.mutation";

/* HOOKS */
import { useSelectedTask } from "@/hooks/use-selected-task";

/* SCHEMA */
import { task_schema, TaskSchemaType, MAX_SUBTASKS } from "@/schema/task-schema";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdDragIndicator } from "react-icons/md";
```

- [ ] **Step 2: Add drag state and handlers inside the component**

After the existing `useFieldArray` destructuring (after line 74 `keyName: "temp_id"`), add:

```tsx
const [drag_sorted_keys, setDragSortedKeys] = useState<string[] | null>(null);
const snapshot_ref = useRef<TaskSchemaType["sub_tasks"]>([]);
const sorted_keys = drag_sorted_keys ?? sub_tasks.map((s) => s.temp_id);
```

Then add the three drag handler functions after the `onEditTaskSubmit` function:

```tsx
/**
 * DOCU: Captures the current subtasks state before dragging starts for rollback on cancel. <br>
 * Triggered: When a subtask field starts being dragged. <br>
 * Last Updated: April 05, 2026
 * @author Jhones
 */
const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
	snapshot_ref.current = form.getValues("sub_tasks");
	setDragSortedKeys(sub_tasks.map((s) => s.temp_id));
};

/**
 * DOCU: Handles the drag over event to reorder subtask fields visually via sorted keys. <br>
 * Triggered: When a dragged subtask field is hovering over another subtask field. <br>
 * Last Updated: April 05, 2026
 * @author Jhones
 */
const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = (event) => {
	setDragSortedKeys((prev) => {
		if (!prev) return null;
		const items = prev.map((key) => ({ id: key }));
		const reordered = move(items, event);
		return reordered.map((item) => item.id);
	});
};

/**
 * DOCU: Commits the reordered subtasks to the form state on drag end, or reverts on cancel. <br>
 * Triggered: When a dragged subtask field is dropped. <br>
 * Last Updated: April 05, 2026
 * @author Jhones
 */
const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = (event) => {
	if (!event.canceled && drag_sorted_keys) {
		const current_values = form.getValues("sub_tasks");
		const new_values = drag_sorted_keys.map((key) => {
			const field_index = sub_tasks.findIndex((s) => s.temp_id === key);
			return current_values[field_index];
		});
		replace(new_values);
	}
	setDragSortedKeys(null);
};
```

- [ ] **Step 3: Add `replace` to the useFieldArray destructuring**

Change the existing destructuring (lines 66–74):

```tsx
const {
	fields: sub_tasks,
	append,
	remove
} = useFieldArray({
	control: form.control,
	name: "sub_tasks",
	keyName: "temp_id"
});
```

To:

```tsx
const {
	fields: sub_tasks,
	append,
	remove,
	replace
} = useFieldArray({
	control: form.control,
	name: "sub_tasks",
	keyName: "temp_id"
});
```

- [ ] **Step 4: Replace the subtasks FormItem JSX section**

Replace the entire `<FormItem>` block for subtasks (lines 155–196) with the DnD-enabled version:

```tsx
<FormItem>
	<FormLabel>Subtasks</FormLabel>
	<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
		<div className="flex flex-col gap-[12]">
			{sorted_keys.map((key, visual_index) => {
				const field_index = sub_tasks.findIndex((s) => s.temp_id === key);
				if (field_index === -1) return null;
				return (
					<SortableSubtaskField key={key} id={key} index={visual_index} disabled={isPending}>
						<FormField
							control={form.control}
							name={`sub_tasks.${field_index}.title`}
							render={({ field }) => (
								<>
									<Input
										{...field}
										defaultValue={field.value}
										value={undefined}
										type="text"
										placeholder="e.g. Done"
										error={errors.sub_tasks?.[field_index]?.title?.message}
										floating_error
									/>
									<button
										type="button"
										className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200 translate-x-2.5"
										onClick={() => remove(field_index)}
									>
										<IoIosClose />
									</button>
								</>
							)}
						/>
					</SortableSubtaskField>
				);
			})}
		</div>
		<DragOverlay dropAnimation={null}>
			{(source) => {
				const field_index = sub_tasks.findIndex((s) => s.temp_id === source.id);
				if (field_index === -1) return null;
				const value = form.getValues(`sub_tasks.${field_index}.title`);
				return (
					<div className="flex items-center rounded-md bg-foreground drop-shadow-md">
						<span className="text-primary -translate-x-0.5">
							<MdDragIndicator size={16} />
						</span>
						<Input type="text" value={value || ""} placeholder="e.g. Done" readOnly />
					</div>
				);
			}}
		</DragOverlay>
	</DragDropProvider>

	{sub_tasks.length < MAX_SUBTASKS && (
		<Button
			type="button"
			variant="secondary"
			onClick={() => append({ title: "" })}
		>
			<FaPlus /> Add New Subtask
		</Button>
	)}
</FormItem>
```
