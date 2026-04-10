# Task Tags Feature Design

## Overview

Add a tagging system to tasks. Tags are scoped per board, managed via the edit board modal, assigned to tasks during create/edit, and displayed as colored pills on task cards.

Filtering by tags is **out of scope** for this iteration.

## Data Model

### New Models

**Tag** — a named, colored label belonging to a board.

```prisma
model Tag {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  color     String    @default("#635FC7")
  boardId   String    @db.Uuid
  board     Board     @relation(fields: [boardId], references: [id], onDelete: Cascade)
  tasks     TaskTag[]
  createdAt DateTime  @default(now()) @db.Timestamp(6)
  updatedAt DateTime  @updatedAt @db.Timestamp(6)

  @@unique([boardId, name])
}
```

**TaskTag** — many-to-many join table between Task and Tag.

```prisma
model TaskTag {
  taskId    String   @db.Uuid
  tagId     String   @db.Uuid
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @db.Timestamp(6)

  @@id([taskId, tagId])
}
```

### Updated Existing Models

- **Board** — add `tags Tag[]` relation
- **Task** — add `tags TaskTag[]` relation

### Constraints

- `@@unique([boardId, name])` prevents duplicate tag names within a board
- Cascade deletes: deleting a board removes its tags; deleting a tag or task removes join table entries

### App Types (`types/index.ts`)

```typescript
export type Tag = Pick<PrismaTag, "id" | "name" | "color">;

export type Board = Pick<PrismaBoard, "id" | "name" | "columnOrder"> & {
  columns?: Column[];
  tags?: Tag[];
};

export type Task = Pick<PrismaTask, "id" | "title" | "isCompleted" | "subtaskOrder"> & {
  description: string;
  subtasks: Subtask[];
  tags: Tag[];
};
```

## Limits (Constants)

| Constant | Default | Location |
|----------|---------|----------|
| `MAX_BOARD_TAGS` | 10 | `schema/tag-schema.ts` |
| `MAX_TASK_TAGS` | 5 | `schema/tag-schema.ts` |

Values are centralized so they can be adjusted easily.

## Tag Management (Board-Level CRUD)

### Location

New "Board Tags" section inside the **edit board modal**, below the existing columns section.

### UI

- Each tag row: `ColorPicker` (reusing existing `components/ui/color-picker.tsx`) + `Input` (tag name) + delete button
- "Add New Tag" button at the bottom (same style as "Add New Column")
- Tags are saved independently from the board form — each add/edit/delete is its own server action + mutation, not batched with the board save

### Server Actions (`actions/`)

| Action | Input | Behavior |
|--------|-------|----------|
| `createTag` | `board_id`, `name`, `color` | Creates a tag on the board |
| `editTag` | `tag_id`, `board_id`, `name`, `color` | Updates tag name and/or color |
| `deleteTag` | `tag_id`, `board_id` | Deletes tag, cascades join table |

### Mutation Hooks (`hooks/mutations/`)

| Hook | Optimistic Update |
|------|-------------------|
| `useCreateTag` | Add to board's `tags` array in cache |
| `useEditTag` | Update in cache (also updates tag pills on visible task cards) |
| `useDeleteTag` | Remove from board's `tags` array + remove from all tasks in cache |

### Zod Schemas (`schema/tag-schema.ts`)

New file with:
- `create_tag_schema` — `board_id`, `name` (min 1), `color`
- `edit_tag_schema` — `tag_id`, `board_id`, `name` (min 1), `color`
- `delete_tag_schema` — `tag_id`, `board_id`

## Tag Assignment (on Tasks)

### Location

New "Tags" section in the **create task** and **edit task** modals, between description and subtasks fields.

### UI

- Board's available tags displayed as clickable colored pills
- Clicking a pill toggles selection (selected state gets a ring/highlight)
- When `MAX_TASK_TAGS` is reached, unselected pills become disabled with reduced opacity
- Selected tags submitted as an array of tag IDs with the form data

### Schema Changes (`schema/task-schema.ts`)

- `create_task_schema` — add `tag_ids: z.array(z.string()).max(MAX_TASK_TAGS).optional()`
- `edit_task_schema` — add `tag_ids: z.array(z.string()).max(MAX_TASK_TAGS).optional()`

### Server Action Changes

- `createTask` — after creating the task, bulk-insert `TaskTag` rows for selected tag IDs
- `editTask` — delete all existing `TaskTag` rows for the task, re-insert for submitted tag IDs

### View Task Modal

Assigned tags displayed as colored pills (read-only) near the top, below the title.

## Tag Display on Task Cards

### Layout

Tags render as colored pills above the task title in `task-item.tsx`:

```
+----------------------------------+
| O  [Feature] [Frontend]    =    |
|    Build settings UI             |
|    2 of 5 subtasks               |
+----------------------------------+
```

### Behavior

- Small rounded pills: tag color as background, white or dark text based on luminance contrast check
- Flex-wrap row above the title, between completion toggle and drag handle
- No tags = no row rendered (no empty space)
- Pills are non-interactive on the card (visual only)

### Sizing

- Font: ~11px, bold
- Padding: 3px 10px
- Border radius: full rounded (pill)

## Query & Cache Updates

### Board Server Action

Update `getBoard` Prisma include:

```typescript
include: {
  tags: true,
  columns: {
    include: {
      tasks: {
        include: {
          subtasks: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      }
    }
  }
}
```

### Response Flattening

The server action flattens `task.tags` from `TaskTag[]` (with nested `tag` object) to a clean `Tag[]` array before returning. No join table shape leaks into the frontend.

### Cache Invalidation

| Mutation | Cache Update |
|----------|-------------|
| Create/edit/delete tag | Invalidate `[...CACHE_KEY_BOARD, board_id]` |
| Create task (with tags) | Optimistic update, include `tags` array |
| Edit task (tag changes) | Optimistic update, update `tags` array |

No new cache keys needed — tags ride on the existing board query.

## Files to Create

| File | Purpose |
|------|---------|
| `schema/tag-schema.ts` | Zod schemas + constants (`MAX_BOARD_TAGS`, `MAX_TASK_TAGS`) |
| `actions/tag.ts` | Server actions: `createTag`, `editTag`, `deleteTag` |
| `hooks/mutations/tag.mutation.ts` | `useCreateTag`, `useEditTag`, `useDeleteTag` |

## Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `Tag`, `TaskTag` models; update `Board`, `Task` relations |
| `types/index.ts` | Add `Tag` type; update `Board` and `Task` types |
| `actions/board.ts` | Update `getBoard` include to fetch tags |
| `actions/task.ts` | Update `createTask`, `editTask` to handle `tag_ids` |
| `schema/task-schema.ts` | Add `tag_ids` to create/edit schemas |
| `components/board/edit-board-modal.tsx` | Add tag manager section |
| `components/task/create-task-modal.tsx` | Add tag selection UI |
| `components/task/edit-task-modal.tsx` | Add tag selection UI |
| `components/task/view-task-modal.tsx` | Display assigned tags (read-only) |
| `components/columns/task-item.tsx` | Display tag pills above title |

## Out of Scope

- Filtering tasks by tags
- Tag ordering/sorting
- Tag usage analytics
