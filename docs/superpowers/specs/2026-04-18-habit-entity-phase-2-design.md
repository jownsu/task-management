# Habit Entity (Phase 2) Design

**Date:** 2026-04-18
**Author:** Jhones
**Status:** Approved
**Follows:** `2026-04-18-board-type-habit-tracker-design.md` (Phase 1)

## Goal

Introduce the `Habit` entity so that habit-tracker boards can persist a list of habits at creation time, parallel to how task-management boards persist columns. Refactor `create-board-modal.tsx` so each board type's form fields live in their own component, using the same `BOARD_VIEWS`-style lookup map pattern established in Phase 1.

## Non-Goals (deferred to Phase 3)

- The daily completion grid UI (habits × days checkmarks)
- `HabitLog` model (per-day completion records)
- Computing `achieved` (count of completed days per habit, per month) — this is a derived value and will be a `COUNT` query over `HabitLog` in Phase 3
- Editing habits after board creation (edit-board modal is untouched)
- Sidebar icon already landed in the habit-tracker icon work — not revisited here

## Data Model

### New Prisma model: `Habit`

```prisma
model Habit {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  theme     String   @default("#635FC7")
  goal      Int      @default(0)
  boardId   String   @db.Uuid
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @db.Timestamp(6)
  updatedAt DateTime @updatedAt @db.Timestamp(6)
}
```

- `goal` is the **target completions per calendar month** (e.g., 20 = "aim for 20 days this month"). An `Int` column with a `0` default.
- No `achieved` column. `achieved` is derived in Phase 3 from `HabitLog`.
- Cascade delete when the parent board is deleted, matching `Column`.

### `Board` model gets `habitOrder`

```prisma
model Board {
  // ...existing fields
  columnOrder String[]  @default([]) @db.Uuid
  habitOrder  String[]  @default([]) @db.Uuid
  // ...existing fields
  habits      Habit[]
}
```

Mirrors `columnOrder` — a UUID array controlling display order.

### Migration

One migration: `add_habit_entity`. Adds the `Habit` table and the `habitOrder` column (defaulting to `[]` for existing boards).

## TypeScript Types (`types/index.ts`)

```ts
export type Habit = Pick<PrismaHabit, "id" | "name" | "theme" | "goal">;

export type Board = Pick<PrismaBoard, "id" | "name" | "columnOrder" | "habitOrder" | "type"> & {
  columns?: Column[];
  habits?: Habit[];
  tags?: Tag[];
};
```

## Zod Schema (`schema/board-schema.ts`)

```ts
export const MAX_HABITS = 10;

export const habit_schema = z.object({
  name: z.string().min(1, "Can't be empty"),
  theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
  goal: z.coerce.number().int().min(0, "Goal must be 0 or more").default(0)
});

// add_board_schema gains a `habits` field (optional, like `columns`):
export const add_board_schema = z.object({
  name: z.string().min(1, "Name is required"),
  type: board_type_schema.default("TASK_MANAGEMENT"),
  columns: z.array(/* existing column shape */).max(MAX_COLUMNS).optional(),
  habits:  z.array(habit_schema).max(MAX_HABITS, `You can only have up to ${MAX_HABITS} habits`).optional()
});
```

`edit_board_schema` is **not** changed in this phase.

## Server Action Changes (`actions/board.actions.ts`)

### `createBoardAction`

Branch on type:
- `TASK_MANAGEMENT` → create columns (as today), set `columnOrder`, leave `habitOrder = []`.
- `HABIT_TRACKER` → create habits from `parsedInput.habits`, set `habitOrder`, leave `columnOrder = []`.

Return shape includes `habitOrder` alongside `columnOrder`.

### `getBoardById`

Extend `include` to load `habits` for habit-tracker boards. Sort by `habitOrder`. Return shape includes `habits` array (empty for task-management boards) and `habitOrder`.

Code path mirrors the columns path:
```ts
habits: sortByIdOrder(board.habits, board.habitOrder).map((habit) => ({
  id: habit.id,
  name: habit.name,
  theme: habit.theme,
  goal: habit.goal
}))
```

### `editBoardAction`

Minimal change: ensure the return object includes `habitOrder` and `habits: []` to satisfy the new `Board` type. No habit editing in this phase.

### `getAllBoards`

Unchanged — sidebar doesn't need habits.

## UI Refactor — `create-board-modal.tsx`

### Before

One big file: name input + type select + columns field array with drag-and-drop + color picker + submit. The columns logic lives directly inside the modal.

### After

The modal is a thin shell:
1. Name input (always)
2. Board Type select (always)
3. **Type-specific form fields** rendered from a `BOARD_FIELDS` lookup map
4. Submit + Cancel

Two new components, parallel to `TaskManagement` / `HabitTrackerBoard` on the detail page:

- **`components/board/task-management-fields.tsx`** exports `TaskManagementFields`. Owns the columns `useFieldArray`, drag state, and all drag handlers (moved verbatim from the modal). Uses `useFormContext<AddBoardSchema>` to reach the form.
- **`components/board/habit-tracker-fields.tsx`** exports `HabitTrackerFields`. Symmetric to `TaskManagementFields` but for the `habits` field array. Each habit has name + color picker + goal (number input).

### Lookup map

In `create-board-modal.tsx`:

```tsx
const BOARD_FIELDS: Record<BoardType, React.ComponentType<{ disabled?: boolean }>> = {
  TASK_MANAGEMENT: TaskManagementFields,
  HABIT_TRACKER: HabitTrackerFields
};

// in JSX:
const Fields = BOARD_FIELDS[selected_type];
// ...
<Fields disabled={isPending} />
```

Matches the `BOARD_VIEWS` pattern on the detail page. Adding a future board type means: one map entry + one new fields component.

### Form defaults

- `columns` default: unchanged (`[{ name: "Todo", ... }, { name: "Doing", ... }]`)
- `habits` default: `[{ name: "Journal", theme: DEFAULT_COLUMN_THEME, goal: 20 }]` (one starter habit so the new user sees the shape)

### Sortable rows

Habits reuse the **same** `SortableColumnField` component. The component is already generic enough — it takes an `id` and `index` and doesn't know about column semantics beyond the name. Reusing it avoids duplication.

### Goal input

`<Input type="number" min={0} />` within each habit row. Zod coerces the string value back to a number at parse time.

## Acceptance Criteria

1. `npx prisma migrate dev` succeeds; existing boards get `habitOrder = []` by default; `Habit` table exists.
2. Creating a **task-management** board works identically to today (columns persist, no habits created).
3. Creating a **habit-tracker** board with habits persists them: the DB row has `habitOrder` populated and N `Habit` rows with correct name/theme/goal.
4. The create-board modal:
   - Shows `<TaskManagementFields>` when type = TASK_MANAGEMENT
   - Shows `<HabitTrackerFields>` when type = HABIT_TRACKER
   - Each subcomponent has its own drag-and-drop reorder behavior
   - Each subcomponent has an "Add New X" button capped at `MAX_COLUMNS` or `MAX_HABITS`
5. The parent modal file is significantly shorter — name + type select + `<Fields />` + submit — no field array logic.
6. `npx tsc --noEmit` passes. `npm run build` passes.
7. Edit-board modal is unchanged.
8. Habit-tracker detail page still renders the `HabitTrackerBoard` stub — no change in Phase 2.

## Files Touched

**Create:**
- `prisma/migrations/<ts>_add_habit_entity/migration.sql` (generated)
- `components/board/task-management-fields.tsx`
- `components/board/habit-tracker-fields.tsx`

**Modify:**
- `prisma/schema.prisma`
- `types/index.ts`
- `schema/board-schema.ts`
- `actions/board.actions.ts`
- `components/board/create-board-modal.tsx`
