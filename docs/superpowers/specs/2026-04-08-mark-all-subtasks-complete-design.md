# Mark All Subtasks Complete — Design Spec

**Date:** 2026-04-08
**Feature:** "Mark all as done" button in the View Task Modal

## Summary

Add a button below the subtask list in the View Task Modal that marks all subtasks as complete in a single atomic operation. The button is only visible when there are subtasks and at least one is incomplete. It disappears once all subtasks are done.

## Requirements

- Button appears **below the subtask list**, before the "Column" dropdown
- **Visibility:** Only shown when `subtasks.length > 0` AND at least one subtask has `isCompleted === false`
- **Hidden when:** All subtasks are already complete, or the task has no subtasks
- Clicking the button marks all subtasks as `isCompleted: true` in a single server request
- Optimistic UI update: all checkboxes flip to checked immediately
- Success toast displayed on completion

## Data Layer

### Zod Schema

**File:** `schema/task-schema.ts`

New schema `mark_all_subtasks_complete_schema`:
- `board_id: z.string()`
- `column_id: z.string()`
- `task_id: z.string()`

No subtask IDs needed — the action updates all subtasks belonging to the task.

### Server Action

**File:** `actions/task.actions.ts`

New action `markAllSubtasksCompleteAction(data: MarkAllSubtasksCompleteSchema)`:
1. Validate input with `mark_all_subtasks_complete_schema`
2. Verify task belongs to the board/column (same ownership verification pattern as existing actions like `updateSubtaskAction`)
3. Execute `prisma.subtask.updateMany({ where: { taskId: data.task_id }, data: { isCompleted: true } })`
4. Return the updated task with subtasks

## Mutation Hook

**File:** `hooks/mutations/mark-all-subtasks-complete.mutation.ts`

New hook `useMarkAllSubtasksComplete(callback?: CallbackResponse)`:
- Follows the same pattern as `useUpdateSubtask` and other existing mutation hooks
- **`mutationFn`:** Calls `markAllSubtasksCompleteAction`
- **`onMutate` (optimistic update):**
  1. Cancel outgoing board queries
  2. Snapshot current board cache
  3. Update cache: set `isCompleted: true` on every subtask of the target task
- **`onError`:** Restore snapshot (rollback)
- **`onSettled`:** Invalidate board query to refetch
- **`onSuccess`:** Call optional `callback.onSuccess`, show success toast
- Accepts optional `CallbackResponse` with `onSuccess`/`onError` callbacks

## UI Component

**File:** `components/task/view-task-modal.tsx`

### Button Placement
Below the subtask list (after `QuickAddSubtask`), before the "Column" section.

### Visibility Logic
```tsx
{subtasks.length > 0 && subtasks.some(s => !s.isCompleted) && (
  <button>Mark all as done</button>
)}
```

### Styling
- Ghost/link-style button — subtle, not visually heavy
- Check icon from `react-icons` + "Mark all as done" text
- Consistent with the modal's existing minimal aesthetic

### Behavior
- On click: calls `markAllSubtasksComplete({ board_id, column_id, task_id })`
- Optimistic update flips all checkboxes immediately
- Button disappears after the update (all subtasks now complete)
- Success toast on completion

## Approach

Single batch server action using Prisma `updateMany` — one network request, atomic update, no partial failure risk. This was chosen over looping individual `useUpdateSubtask` calls to avoid race conditions and flickering.
