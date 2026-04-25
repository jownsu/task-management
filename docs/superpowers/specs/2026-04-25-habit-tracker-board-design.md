# Habit Tracker Board — Design

**Date:** 2026-04-25
**Branch:** `feature/habits-board`
**Status:** Approved by user; ready for implementation plan

## Goal

Implement the main content of the Habit Tracker board so users can:
- View all habits in a month-long grid
- Toggle completion of any day for any habit
- See per-habit Goal vs Achieved counts with green/yellow status colors
- Navigate between months
- Add new habits via a dedicated modal

Visual reference matches the user-provided design: a wide grid with weekday/day-number headers, today's column highlighted black, logged cells tinted with the habit's theme color and showing a check, and Goal/Achieved columns on the right.

## Non-Goals

- Streak tracking, weekly/yearly views, statistics dashboards
- Notifications/reminders
- Drag-to-reorder habits inline (already exists in EditHabitBoardModal)
- Authentication changes

## Approach

**Selected:** Logs as a separate React Query keyed by `(boardId, year, month)`, fetched client-side from the URL `?month=YYYY-MM` param.

**Rejected:**
- Logs nested in the board query — invalidates entire board on month switch
- Server-computed `achieved` per habit — couples server to view logic for trivial client math

## Data Model

New `HabitLog` model in `prisma/schema.prisma`. Presence of a row = completed; absence = not completed. No `isCompleted` boolean.

```prisma
model HabitLog {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  habitId   String   @db.Uuid
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  date      DateTime @db.Date
  createdAt DateTime @default(now()) @db.Timestamp(6)

  @@unique([habitId, date])
  @@index([habitId])
}
```

Update `Habit`:
```prisma
model Habit {
  // existing fields...
  logs HabitLog[]
}
```

Update `types/index.ts`:
```ts
export type HabitLog = { habitId: string; date: string }; // date as YYYY-MM-DD
```

Migration: `npx prisma migrate dev --name add-habit-log`.

## Server Actions

New file: `actions/habit-log.actions.ts`.

### `getHabitLogsForBoard(boardId, year, month)`
- Plain async function (queryFn-friendly, no auth wrapper required since it's read-only and scoped by URL)
- Range filter: `date >= first-of-month` AND `date < first-of-next-month`
- Joined to habit to filter by `boardId`
- Returns `Array<{ habitId: string; date: string }>` (date stringified `YYYY-MM-DD`)

### `toggleHabitLog({ habitId, date })`
- `authActionClient.schema(toggle_habit_log_schema).action(...)`
- Schema: `{ habitId: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }`
- Logic: `findUnique` on `(habitId, date)` → if exists, delete; else create
- Returns `{ habitId, date, completed: boolean }`

### `addHabit({ boardId, name, theme, goal })`
- `authActionClient.schema(add_habit_schema).action(...)`
- Inside transaction: create habit, append `id` to `Board.habitOrder`
- Returns the new habit `{ id, name, theme, goal }`

## Hooks

### Queries — `hooks/queries/habit-log.query.ts`
- `useGetHabitLogs(boardId, year, month)` → `useQuery` with key `[...CACHE_KEY_HABIT_LOGS, boardId, year, month]`, queryFn calls `getHabitLogsForBoard`
- `staleTime: STALE_TIME`
- `enabled: !!boardId`

### Mutations
- `useToggleHabitLog` (in `hooks/mutations/habit-log.mutation.ts`) — optimistic update on the visible-month logs cache; rollback on error
- `useAddHabit` (in `hooks/mutations/habit.mutation.ts`) — invalidates the habit-tracker-board query

### Constants
Add to `constants/query-keys.ts`:
```ts
export const CACHE_KEY_HABIT_LOGS = ["habit-logs"];
```

## URL State (nuqs)

- Install `nuqs`
- Wrap `app/layout.tsx` in `<NuqsAdapter>` (Next.js App Router)
- In `habit-tracker-board.tsx`: `const [month, setMonth] = useQueryState("month", parseAsString.withDefault(currentYearMonth()))`
- `currentYearMonth()` returns `YYYY-MM` for today in local time
- Prev/next buttons compute new month string and call `setMonth`
- Invalid/missing values → default to current month

## Components

New directory: `components/board/habit-tracker/`.

```
habit-tracker-board.tsx     (replaces placeholder; orchestrator)
month-picker.tsx            (< March, 2021 > header)
habit-grid.tsx              (CSS Grid table wrapper)
habit-grid-header.tsx       (Habits | M T W ... | Goal | Achieved)
habit-row.tsx               (single row: name + day cells + goal + achieved)
habit-cell.tsx              (single day cell, clickable)
add-habit-modal.tsx         (single-habit form)
add-habit-button.tsx        (+ New Habit link, opens modal)
```

### Layout Strategy

- CSS Grid with `grid-template-columns: 160px repeat(N, 32px) 64px 80px` where N = days in month
- Outer container: horizontally scrollable on overflow
- Left column (Habits) and right columns (Goal, Achieved) use `position: sticky`
- Today's column header: black background, white day number
- Today's column body cells: white background (no theme tint), but checkmark still rendered if logged

### Data Flow (`habit-tracker-board.tsx`)

1. `const [month] = useQueryState("month", ...)` → `"2026-04"`
2. Parse to `{ year, month_num }`
3. `const { board } = useGetHabitTrackerBoard(board_id)` → `habits[]`
4. `const { logs } = useGetHabitLogs(board_id, year, month_num)`
5. Build `const logged_set = new Set(logs.map(l => `${l.habitId}-${l.date}`))` for O(1) cell lookup
6. For each habit, compute `achieved = logs.filter(l => l.habitId === habit.id).length`
7. Render `<MonthPicker />`, `<HabitGrid habits logs={logged_set} year month_num />`, `<AddHabitButton />`
8. Existing `<EditHabitBoardModal />`, `<DeleteBoardModal />`, plus new `<AddHabitModal />` rendered at this level

## Modals

`useBoardStore.modals` gains a new key: `add_habit: boolean`. The store interface stays the same — pattern matches existing modal flags.

`AddHabitModal`:
- Form fields: `name` (text, required), `theme` (ColorPicker, default `DEFAULT_COLUMN_THEME`), `goal` (number, default 20)
- Zod schema: `add_habit_schema` in `schema/board-schema.ts`
- On submit: `useAddHabit` → close modal, board query invalidates, new habit appears at end of grid

## UX Details

### Cell Visual States
- **Logged (not today):** theme color at ~25% opacity background, dark checkmark
- **Not logged (not today):** transparent background
- **Hover (not today):** theme color at ~10% opacity tint
- **Today, logged:** white background, theme-colored checkmark (today's column stays visually distinct)
- **Today, not logged:** white background, no checkmark

### Achieved Cell Color
- `achieved >= goal` → green (e.g., `bg-green-500`, white text)
- `achieved < goal` → yellow (e.g., `bg-yellow-400`, dark text)
- Binary, no three-tier gradient

### Today Detection
- Computed once per render from `new Date()` in user local time
- Format: `YYYY-MM-DD` string compared against day cells

### Optimistic Toggle Flow
1. Click cell → compute `${habitId}-${date}` key
2. Snapshot current logs array from cache
3. Optimistically update: add the entry if missing, remove if present
4. Fire `useToggleHabitLog` mutation
5. On error: revert to snapshot, show toast

### Empty State
- Board has 0 habits: render only the day-header row (no habit rows), then "+ New Habit" prompt centered below the grid

## Acceptance Criteria

- [ ] Visiting `/habits/[board_id]` defaults to current month, URL shows `?month=YYYY-MM`
- [ ] Prev/next month buttons update the URL and refetch logs
- [ ] All habits appear as rows in `habitOrder` order
- [ ] Day columns span exactly the days of the displayed month (28-31)
- [ ] Today's column header has a black background; day number is white
- [ ] Clicking a cell toggles its logged state with no perceptible delay (optimistic)
- [ ] Goal column shows the configured goal per habit
- [ ] Achieved column shows count of logs in the displayed month per habit
- [ ] Achieved cell is green when `achieved >= goal`, yellow otherwise
- [ ] "+ New Habit" link opens AddHabitModal; submitting creates the habit and appends it to the grid
- [ ] EditHabitBoardModal and DeleteBoardModal continue to function from the navbar
- [ ] Mobile: grid scrolls horizontally; Habits/Goal/Achieved columns stay sticky
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)

## Implementation Order

1. Prisma migration (`HabitLog` model)
2. Server actions (`actions/habit-log.actions.ts`, `addHabit`)
3. Schemas (`add_habit_schema`, `toggle_habit_log_schema`)
4. Constants (`CACHE_KEY_HABIT_LOGS`)
5. Query/mutation hooks
6. Install nuqs + wrap layout
7. Components (bottom-up: cell → row → header → grid → board → modals)
8. Wire `AddHabitModal` into `useBoardStore.modals`
9. Manual browser testing across month navigation, toggle, add habit, delete habit

## Out of Scope (Future Work)

- Server-side prefetch of habit logs (only board habits are prefetched today)
- Streak/statistics views
- Bulk-mark or copy-from-yesterday
- Reminders/notifications
- Per-habit notes per day
