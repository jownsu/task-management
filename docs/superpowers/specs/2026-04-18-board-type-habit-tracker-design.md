# Board Type — Habit Tracker (Phase 1) Design

**Date:** 2026-04-18
**Author:** Jhones
**Status:** Approved (awaiting implementation plan)

## Goal

Introduce a `type` discriminator on the `Board` model so the app can support multiple board shapes. Phase 1 adds a second type — **Habit Tracker** — whose UI is stubbed as an `<h1>Habit Tracker</h1>` placeholder. The existing Kanban experience must continue to work unchanged for all existing boards.

The full habit-tracker feature (daily grid, habits, completion logs, streaks) is **out of scope** for this phase. This spec only establishes the type mechanism, the create-time selector, and the conditional render on the board detail page.

## Non-Goals

- Habit, HabitLog, or any habit-tracker-specific models
- Editing a board's type after creation
- Per-type sidebar icons
- Seed data for habit tracker boards
- Any habit tracker UI beyond the stub `<h1>`

## Architecture Overview

`Board` gains a new required enum column, `type`, defaulting to `KANBAN`. All existing rows migrate to `KANBAN` automatically via the default.

The create-board form adds a **Board Type** select. When the selected type is `KANBAN`, the form collects columns exactly as today. When the selected type is `HABIT_TRACKER`, the columns section is hidden and the server creates a board with no columns and an empty `columnOrder`.

The board detail page reads `board.type` from the prefetched query cache and branches its subtree: existing column/task UI for `KANBAN`, stub `<h1>Habit Tracker</h1>` for `HABIT_TRACKER`.

## Data Model Changes

### Prisma Schema (`prisma/schema.prisma`)

Add a new enum and a new field on `Board`:

```prisma
enum BoardType {
  KANBAN
  HABIT_TRACKER
}

model Board {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String
  type        BoardType @default(KANBAN)
  columnOrder String[]  @default([]) @db.Uuid
  userId      String    @db.Uuid
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  columns     Column[]
  createdAt   DateTime  @default(now()) @db.Timestamp(6)
  updatedAt   DateTime  @updatedAt @db.Timestamp(6)
  tags        Tag[]
}
```

### Migration

Run `npx prisma migrate dev --name add_board_type`. The enum default handles existing rows; no manual backfill required.

### TypeScript Types (`types/index.ts`)

Extend the `Board` type to include `type`:

```ts
export type Board = Pick<PrismaBoard, "id" | "name" | "columnOrder" | "type"> & {
  columns?: Column[];
  tags?: Tag[];
};
```

## Validation Changes (`schema/board-schema.ts`)

Add a reusable board-type enum and make `columns` optional at the schema level. Runtime enforcement of "columns required when type is KANBAN" is handled by the form UI (the columns field is always present when type is `KANBAN`, with its existing min-length validation). The server action also guards on type before creating columns.

```ts
export const BOARD_TYPES = ["KANBAN", "HABIT_TRACKER"] as const;
export const board_type_schema = z.enum(BOARD_TYPES);

export const add_board_schema = z.object({
  name: z.string().min(1, "Name is required"),
  type: board_type_schema.default("KANBAN"),
  columns: z
    .array(
      z.object({
        name: z.string().min(1, "Can't be empty"),
        theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
      })
    )
    .max(MAX_COLUMNS, `You can only have up to ${MAX_COLUMNS} columns`)
    .optional()
});

export type BoardType = z.infer<typeof board_type_schema>;
```

`edit_board_schema` is **not** modified in this phase; board type is immutable after creation.

## Server Action Changes (`actions/board.actions.ts`)

### `createBoardAction`

Accept `type` from `parsedInput`. Persist `type` on the board. Only create columns and populate `columnOrder` when `type === "KANBAN"`.

```ts
export const createBoardAction = authActionClient
  .schema(add_board_schema)
  .action(async ({ parsedInput, ctx }) => {
    const board = await prisma.$transaction(async (tx) => {
      const new_board = await tx.board.create({
        data: {
          name: parsedInput.name,
          type: parsedInput.type,
          userId: ctx.userId,
          columns:
            parsedInput.type === "KANBAN" && parsedInput.columns
              ? { create: parsedInput.columns.map((c) => ({ name: c.name, theme: c.theme })) }
              : undefined
        },
        include: {
          columns: { select: { id: true }, orderBy: { createdAt: "asc" } }
        }
      });

      const updated_board = await tx.board.update({
        where: { id: new_board.id },
        data: { columnOrder: new_board.columns.map((c) => c.id) },
        select: { id: true, name: true, type: true, columnOrder: true }
      });

      await tx.user.update({
        where: { id: ctx.userId },
        data: { boardOrder: { push: updated_board.id } }
      });

      return updated_board;
    });

    return board;
  });
```

For a `HABIT_TRACKER` board, `new_board.columns` is `[]`, so `columnOrder` stays `[]` — correct and intentional.

### `getBoardById`

Add `type` to the mapped return object:

```ts
return {
  id: board.id,
  name: board.name,
  type: board.type,
  columnOrder: board.columnOrder,
  // ...rest unchanged
};
```

### `getAllBoards`

Add `type: true` to the `select` shape and include `type` on each returned row. No UI consumer yet; this is forward-looking so future sidebar icons can read the type without a refetch.

```ts
prisma.board.findMany({
  where: { userId: user.id },
  select: { id: true, name: true, type: true },
  orderBy: { createdAt: "asc" }
}),
```

Also update the return type:

```ts
export async function getAllBoards(): Promise<Pick<Board, "id" | "name" | "type">[]>
```

## Query Layer Changes (`hooks/queries/board.query.ts`)

`prefetchBoard` must expose the prefetched `board` object to its single caller (the detail page), because the page needs `board.type` to decide what to render. Refactor it to return both the dehydrated state and the board snapshot:

```ts
export const prefetchBoard = async (board_id: string) => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [...CACHE_KEY_BOARD, board_id],
    queryFn: () => getBoardById(board_id),
    staleTime: STALE_TIME
  });

  const board = queryClient.getQueryData<Board>([...CACHE_KEY_BOARD, board_id]);

  return { dehydrated_state: dehydrate(queryClient), board };
};
```

`useGetBoard` is unchanged.

## UI Changes

### Create Board Modal (`components/board/create-board-modal.tsx`)

1. Import the `Select` primitives from `@/components/ui/select`.
2. Add `type` to the form's `defaultValues` as `"KANBAN"`.
3. Add a **Board Type** `FormField` just above the **Board Name** field:

   ```tsx
   <FormField
     control={form.control}
     name="type"
     render={({ field }) => (
       <FormItem>
         <FormLabel>Board Type</FormLabel>
         <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
           <SelectTrigger>
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="KANBAN">Kanban (Task Management)</SelectItem>
             <SelectItem value="HABIT_TRACKER">Habit Tracker</SelectItem>
           </SelectContent>
         </Select>
       </FormItem>
     )}
   />
   ```

4. Wrap the existing **Board Columns** `<FormItem>` (including its `DragDropProvider`, sortable list, overlay, and "Add New Column" button) in a conditional: render only when the watched value of `type` is `"KANBAN"`.

   ```tsx
   const selected_type = form.watch("type");
   // ...
   {selected_type === "KANBAN" && (
     <FormItem>
       {/* existing columns UI */}
     </FormItem>
   )}
   ```

5. No change to the submit handler; the server action handles the type branching.

Edit modal is **not** touched.

### Board Detail Page (`app/(pages)/[board_id]/page.tsx`)

Read the prefetched board and branch render:

```tsx
const TaskPage = async ({ params }: Props) => {
  const { board_id } = (await params) as { board_id: string };
  const { dehydrated_state, board } = await prefetchBoard(board_id);

  return (
    <HydrationBoundary state={dehydrated_state}>
      <Navbar />
      <MainContainer>
        {board?.type === "HABIT_TRACKER" ? (
          <div className="p-[24]">
            <h1 className="text-h-xl">Habit Tracker</h1>
          </div>
        ) : (
          <div className="h-full overflow-auto p-[24]">
            <FilterBar />
            <ColumnList />
            <CreateColumnModal />
            <CreateTaskModal />
            <EditBoardmodal />
            <EditTagsModal />
            <DeleteBoardModal />
            <ViewTaskModal />
            <EditTaskModal />
            <DeleteTaskModal />
          </div>
        )}
      </MainContainer>
    </HydrationBoundary>
  );
};
```

If `board` is `undefined` (not found), the ternary falls through to the Kanban branch, which is the same behavior as today (the underlying query will surface the error client-side).

## Acceptance Criteria

1. `npx prisma migrate dev --name add_board_type` succeeds and existing boards show `type = KANBAN` when queried.
2. Opening the Create Board modal shows a **Board Type** select defaulting to **Kanban (Task Management)**.
3. Selecting **Kanban (Task Management)** shows the existing columns section with the same behavior as before this change.
4. Selecting **Habit Tracker** hides the columns section entirely.
5. Submitting with **Kanban** creates a board identical to today (name + columns + columnOrder populated).
6. Submitting with **Habit Tracker** creates a board with `type = HABIT_TRACKER`, no columns, and empty `columnOrder`.
7. Navigating to a Kanban board renders the existing task UI (columns, filter bar, all modals) unchanged.
8. Navigating to a Habit Tracker board renders only the `<h1>Habit Tracker</h1>` stub inside the standard `MainContainer` / `Navbar` layout.
9. The edit board modal is unchanged; board type cannot be edited.

## Files Touched

- `prisma/schema.prisma` — add `BoardType` enum and `Board.type` field
- `prisma/migrations/<timestamp>_add_board_type/…` — generated migration
- `schema/board-schema.ts` — add `BOARD_TYPES`, `board_type_schema`, `BoardType` type, update `add_board_schema`
- `types/index.ts` — extend `Board` with `type`
- `actions/board.actions.ts` — `createBoardAction`, `getBoardById`, `getAllBoards`
- `hooks/queries/board.query.ts` — refactor `prefetchBoard` return shape
- `components/board/create-board-modal.tsx` — add Board Type select, conditional columns
- `app/(pages)/[board_id]/page.tsx` — consume new `prefetchBoard` return, conditional render
