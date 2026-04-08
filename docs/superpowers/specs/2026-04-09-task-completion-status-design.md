# Task Completion Status

## Overview

Add an `isCompleted` boolean field to the Task model so users can mark tasks as done. This provides a clear, explicit completion state at the task level — independent from subtask completion, with one convenience: completing all subtasks auto-completes the task.

## Data Model

### Prisma Schema

Add to the `Task` model:

```prisma
isCompleted Boolean @default(false)
```

### App Type

Update `Task` type in `types/index.ts` to include `isCompleted` from the Prisma model.

## Behavior Rules

| Trigger | Effect |
|---|---|
| User manually marks task as done | `task.isCompleted = true`. Subtasks are left as-is. |
| User manually marks task as incomplete | `task.isCompleted = false`. Subtasks are left as-is. |
| Last incomplete subtask is completed | Auto-set `task.isCompleted = true`. |
| Subtask unchecked on a completed task | Task stays `isCompleted = true`. |

## Server Action

### `toggleTaskComplete`

- **Input:** `task_id`, `board_id`, `column_id`, `isCompleted` (the new boolean value)
- **Behavior:** Updates `task.isCompleted` in the database

### Modify existing subtask toggle

After toggling a subtask's `isCompleted`, check if all subtasks for that task are now completed. If yes, auto-set `task.isCompleted = true`.

## Zod Schema

New `toggle_task_complete_schema` in `schema/task-schema.ts`:

- `task_id`: string (UUID)
- `board_id`: string (UUID)
- `column_id`: string (UUID)
- `isCompleted`: boolean

## Mutation Hook

### `useToggleTaskComplete`

- Calls `toggleTaskComplete` server action
- Optimistic update: immediately toggles `isCompleted` in the React Query cache for the board
- Follows existing mutation hook pattern with optional `CallbackResponse`

## UI Changes

### Task Card (`components/columns/task-item.tsx`)

- Add a small checkmark toggle button on the card
- When `isCompleted = true`:
  - Green-tinted background/border
  - Strikethrough on the title
  - Checkmark button appears filled/active
- Clicking the checkmark toggles `isCompleted`

### View Task Modal (`components/task/view-task-modal.tsx`)

- Replace the existing "Mark all as done" button with a "Mark as done" / "Mark as incomplete" toggle button for the task
- When task is completed, show a visual indicator on the title area (e.g., checkmark badge or subtle green accent)
- Subtask checkboxes remain unchanged — users can still toggle subtasks independently

## What Stays the Same

- Marking a task as done does NOT auto-complete subtasks
- Unchecking a subtask on a completed task does NOT unmark the task
- No filtering/hiding — completed tasks are always visible
- Existing subtask toggle behavior is unchanged (except for the auto-complete-task check)
