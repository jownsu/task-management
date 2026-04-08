# Mark All Subtasks Complete — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Mark all as done" button to the View Task Modal that marks all subtasks as complete in a single atomic operation.

**Architecture:** New Zod schema + server action (`updateMany`) + mutation hook with optimistic cache update + button in the View Task Modal. Follows the exact same patterns as the existing `useUpdateSubtask` hook.

**Tech Stack:** Next.js Server Actions, Prisma `updateMany`, TanStack React Query (optimistic updates), Zod, react-icons

---

### Task 1: Add Zod Schema

**Files:**
- Modify: `schema/task-schema.ts:86-102` (append after `reorder_subtask_schema`)

- [ ] **Step 1: Add the schema and exported type**

Add after the `add_subtask_schema` block (after line 102) in `schema/task-schema.ts`:

```typescript
export const mark_all_subtasks_complete_schema = z.object({
	board_id: z.string(),
	column_id: z.string(),
	task_id: z.string()
});

export type MarkAllSubtasksCompleteSchemaType = z.infer<typeof mark_all_subtasks_complete_schema>;
```

- [ ] **Step 2: Verify the file has no syntax errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `task-schema.ts`

- [ ] **Step 3: Commit**

```bash
git add schema/task-schema.ts
git commit -m "feat: add Zod schema for mark all subtasks complete"
```

---

### Task 2: Add Server Action

**Files:**
- Modify: `actions/task.actions.ts` (add import of new schema, add new action after `addSubtaskAction`)
- Modify: `schema/task-schema.ts` (import reference only — already modified in Task 1)

- [ ] **Step 1: Add the schema import**

In `actions/task.actions.ts`, update the schema import on line 8 to include `mark_all_subtasks_complete_schema`:

```typescript
import { add_subtask_schema, create_task_schema, delete_task_schema, edit_task_schema, mark_all_subtasks_complete_schema, MAX_SUBTASKS, reorder_subtask_schema, reorder_task_schema, update_subtask_schema, update_task_column_schema } from "@/schema/task-schema";
```

- [ ] **Step 2: Add the server action**

Add after the `addSubtaskAction` export (after line 466) in `actions/task.actions.ts`:

```typescript
/**
 * DOCU: Marks all subtasks of a task as completed in a single batch update. <br>
 * Triggered: On clicking the "Mark all as done" button in the view task modal. <br>
 * Last Updated: April 08, 2026
 * @author Jhones
 */
export const markAllSubtasksCompleteAction = authActionClient
	.schema(mark_all_subtasks_complete_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { board_id, task_id } = parsedInput;

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

		await prisma.subtask.updateMany({
			where: { taskId: task_id },
			data: { isCompleted: true }
		});
	});
```

- [ ] **Step 3: Verify no syntax/type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `task.actions.ts`

- [ ] **Step 4: Commit**

```bash
git add actions/task.actions.ts
git commit -m "feat: add server action for marking all subtasks complete"
```

---

### Task 3: Add Mutation Hook

**Files:**
- Create: `hooks/mutations/mark-all-subtasks-complete.mutation.ts`

- [ ] **Step 1: Create the mutation hook file**

Create `hooks/mutations/mark-all-subtasks-complete.mutation.ts`:

```typescript
/* ACTIONS */
import { markAllSubtasksCompleteAction } from "@/actions/task.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { MarkAllSubtasksCompleteSchemaType } from "@/schema/task-schema";

/* TYPES */
import { Board, CallbackResponse } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARD } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * DOCU: Will mark all subtasks of a task as completed with optimistic updates. <br>
 * Triggered: On clicking the "Mark all as done" button in the view task modal. <br>
 * Last Updated: April 08, 2026
 * @author Jhones
 */
export const useMarkAllSubtasksComplete = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: markAllSubtasksComplete, ...rest } = useMutation({
		mutationFn: (payload: MarkAllSubtasksCompleteSchemaType) => executeAction(markAllSubtasksCompleteAction(payload)),
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
									? {
										...task,
										subtasks: task.subtasks.map((subtask) => ({ ...subtask, isCompleted: true }))
									}
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
		onSuccess: () => {
			toast.success("All subtasks marked as done.");
			callback?.onSuccess?.();
		}
	});

	return { markAllSubtasksComplete, ...rest };
};
```

- [ ] **Step 2: Verify no syntax/type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `mark-all-subtasks-complete.mutation.ts`

- [ ] **Step 3: Commit**

```bash
git add hooks/mutations/mark-all-subtasks-complete.mutation.ts
git commit -m "feat: add useMarkAllSubtasksComplete mutation hook with optimistic updates"
```

---

### Task 4: Add "Mark All as Done" Button to View Task Modal

**Files:**
- Modify: `components/task/view-task-modal.tsx`

- [ ] **Step 1: Add the mutation import**

In `components/task/view-task-modal.tsx`, add below the existing mutations import (line 34):

```typescript
import { useMarkAllSubtasksComplete } from "@/hooks/mutations/mark-all-subtasks-complete.mutation";
```

Add a new icon import — update the existing react-icons import (line 46):

```typescript
import { MdDragIndicator, MdCheckBox } from "react-icons/md";
```

- [ ] **Step 2: Initialize the mutation hook**

In `components/task/view-task-modal.tsx`, add after the `useReorderSubtask` line (line 58):

```typescript
const { markAllSubtasksComplete, isPending: is_marking_all } = useMarkAllSubtasksComplete();
```

- [ ] **Step 3: Add the button in the template**

In `components/task/view-task-modal.tsx`, find the `QuickAddSubtask` block (lines 241-248). Add the "Mark all as done" button **after** the `QuickAddSubtask` component and **before** the closing `</div>` of the subtask section (before line 249).

Add this between the `QuickAddSubtask` block and the closing `</div>`:

```tsx
{subtasks.length > 0 && subtasks.some((subtask) => !subtask.isCompleted) && selected_task && (
	<Button
		variant="ghost"
		size="sm"
		className="text-primary gap-[8] self-start t-[13] font-bold"
		disabled={is_marking_all || is_updating_subtask || is_reordering}
		onClick={() => {
			markAllSubtasksComplete({
				board_id,
				column_id: selected_task.column_id,
				task_id: selected_task.id
			});
		}}
	>
		<MdCheckBox size={16} />
		Mark all as done
	</Button>
)}
```

- [ ] **Step 4: Verify no syntax/type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 5: Visual verification**

Run: `npm run dev`
Open the app, navigate to a board with a task that has subtasks (some incomplete). Open the View Task Modal and verify:
1. The "Mark all as done" button appears below the subtask list
2. Clicking it checks all subtasks immediately (optimistic update)
3. The button disappears after all subtasks are checked
4. A success toast appears
5. The button does NOT appear when all subtasks are already done
6. The button does NOT appear when the task has no subtasks

- [ ] **Step 6: Commit**

```bash
git add components/task/view-task-modal.tsx
git commit -m "feat: add mark all subtasks as done button to view task modal"
```
