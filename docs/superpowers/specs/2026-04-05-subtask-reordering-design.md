# Subtask Reordering via Drag-and-Drop

**Date:** 2026-04-05
**Author:** Jhones
**Status:** Approved

## Overview

Add drag-and-drop reordering of subtasks in two modals:

1. **view-task-modal** — live persist on drop (like `boards-list.tsx`)
2. **edit-task-modal** — form-based reorder committed on submit (like `create-board-modal.tsx`)

Both use a shared `SortableSubtaskField` wrapper component (mirrors `SortableColumnField`).

## Existing Infrastructure

- `Task` model has `subtaskOrder String[] @db.Uuid` — already used for ordering
- `sortByIdOrder()` already sorts subtasks by `subtaskOrder` in board actions
- `SortableColumnField` provides the exact pattern for the sortable wrapper
- `@dnd-kit/react` + `@dnd-kit/helpers` already installed

## New Files

### 1. `components/task/sortable-subtask-field.tsx`

Reusable sortable wrapper identical in structure to `SortableColumnField`:

- **Props:** `id: string`, `index: number`, `children: React.ReactNode`, `disabled?: boolean`
- **DnD config:** `useSortable` with `type: "subtask-field"`, `accept: "subtask-field"`, `group: "subtasks"`
- **Drag handle:** `MdDragIndicator` icon, `cursor-grab`, primary color
- **Dragging state:** `border-dashed border-2 border-primary !bg-transparent`, children opacity-0

### 2. `schema/task-schema.ts` (addition)

New schema `reorder_subtask_schema`:

```typescript
{
  board_id: z.string().uuid(),
  column_id: z.string().uuid(),
  task_id: z.string().uuid(),
  updated_subtask_order: z.array(z.string().uuid())
}
```

Inferred type: `ReorderSubtaskSchema`

### 3. `actions/task.actions.ts` (addition)

New server action `reorderSubtaskAction`:

- Validates the task belongs to a board owned by the current user
- Updates `task.subtaskOrder` with the new order array
- Uses `authActionClient` with `reorder_subtask_schema`

### 4. `hooks/mutations/task.mutation.ts` (addition)

New mutation hook `useReorderSubtask`:

- **mutationFn:** calls `reorderSubtaskAction` via `executeAction`
- **onMutate (optimistic):**
  - Cancel board query
  - Snapshot `previous_board`
  - Reorder subtasks in the matching task within the board cache using `updated_subtask_order`
- **onError:** rollback to `previous_board`, show toast error
- **onSuccess:** optional callback

## Modified Files

### 5. `components/task/view-task-modal.tsx`

**Pattern:** `boards-list.tsx` (local state + immediate persist)

Changes:
- Add local `subtasks` state initialized from `selected_task?.subtasks`
- Add `subtasks_snapshot_ref` for rollback on cancel
- Wrap subtask list with `DragDropProvider`
- Each subtask wrapped in `SortableSubtaskField`
- `handleDragStart`: snapshot current subtasks
- `handleDragOver`: `move()` local subtasks state
- `handleDragEnd`: if order changed, call `reorderSubtask()` mutation
- `DragOverlay`: renders subtask with checkbox + title, dashed border styling
- Sync local state with `selected_task?.subtasks` via `useEffect` (like `boards-list.tsx` syncs with fetched data)

### 6. `components/task/edit-task-modal.tsx`

**Pattern:** `create-board-modal.tsx` (sorted keys + useFieldArray)

Changes:
- Add `drag_sorted_keys` state and `snapshot_ref`
- Compute `sorted_keys` from `drag_sorted_keys ?? sub_tasks.map(s => s.temp_id)`
- Change `useFieldArray` to include `keyName: "temp_id"` (already present)
- Wrap subtask fields with `DragDropProvider`
- Render subtasks by iterating `sorted_keys`, mapping each to `field_index`
- Each subtask wrapped in `SortableSubtaskField`
- `handleDragStart`: snapshot form values, set drag_sorted_keys
- `handleDragOver`: reorder `drag_sorted_keys` via `move()`
- `handleDragEnd`: `replace()` useFieldArray with reordered values
- `DragOverlay`: renders input field with dashed border + drag indicator styling
- No new mutation needed — form submission already sends subtasks in array order, and `editTaskAction` saves `subtaskOrder` accordingly

## Drag Overlay Styling

Both modals use consistent drag overlay styling matching existing patterns:

```
- Container: rounded-md bg-foreground drop-shadow-md
- Drag indicator: text-primary, -translate-x-0.5
- Border style (on source): border-dashed border-2 border-primary !bg-transparent
```

## Data Flow

### view-task-modal (live persist)

```
User drags subtask
  → handleDragStart: snapshot subtasks to ref
  → handleDragOver: move() updates local subtasks state
  → handleDragEnd:
    - If canceled: restore snapshot
    - If order unchanged: no-op
    - If changed: call reorderSubtask({ board_id, column_id, task_id, updated_subtask_order })
      → onMutate: optimistic cache update on board query
      → Server: update task.subtaskOrder
      → onError: rollback to previous_board, toast error
```

### edit-task-modal (form-based)

```
User drags subtask field
  → handleDragStart: snapshot form values, set drag_sorted_keys
  → handleDragOver: reorder drag_sorted_keys via move()
  → handleDragEnd:
    - If canceled: clear drag_sorted_keys (reverts to field order)
    - If committed: replace() useFieldArray with reordered values
  → On form submit: editTask sends sub_tasks in current array order
    → Server: saves subtaskOrder from array order
```

## Edge Cases

- **Single or zero subtasks:** Drag is technically possible but order is irrelevant — `disabled` prop on `SortableSubtaskField` when `subtasks.length <= 1`
- **Concurrent subtask toggle + reorder:** Toggle updates `isCompleted` on a specific subtask; reorder updates `subtaskOrder` on the task. No conflict — they touch different fields.
- **Pending state:** Disable drag while `is_reordering` is true (view-task-modal) or while `isPending` is true (edit-task-modal)
