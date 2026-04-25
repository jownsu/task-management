# Habit Tracker Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **PROJECT RULE:** This codebase has a hard rule: **NEVER run `git commit` without explicit user permission.** Each task ends with a "stage for review" step (`git add ...`). Do NOT run `git commit` — wait for the user.

**Goal:** Implement the habit-tracker board main content — a month-grid where each habit row has clickable day cells (toggle completion), a goal cell, and an achieved cell — matching the user-provided design image.

**Architecture:** A new `HabitLog` Prisma model (presence = completed). Habit logs are fetched by `(boardId, year, month)` via a dedicated React Query hook keyed off the URL `?month=YYYY-MM` param (managed with nuqs). Toggling uses an optimistic mutation. Habits are reused from the existing board query; a new `addHabit` action + modal supports the "+ New Habit" flow.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Prisma 7 (PostgreSQL), TanStack React Query v5, Zustand v5, react-hook-form + Zod, next-safe-action, nuqs, Tailwind CSS v4, shadcn/ui (Dialog, Form, Input, Button), react-icons.

**Conventions:** snake_case variables, camelCase functions, PascalCase types, kebab-case files. Tailwind arbitrary values are integers only (`p-[20]`, not `p-[20px]`). Tabs for indentation, double quotes. JSDoc on every function.

**Spec:** `docs/superpowers/specs/2026-04-25-habit-tracker-board-design.md`

---

## File Map

**Create:**
- `actions/habit-log.actions.ts`
- `hooks/queries/habit-log.query.ts`
- `hooks/mutations/habit-log.mutation.ts`
- `hooks/mutations/habit.mutation.ts`
- `lib/date-helpers.ts`
- `components/board/habit-tracker/habit-cell.tsx`
- `components/board/habit-tracker/habit-row.tsx`
- `components/board/habit-tracker/habit-grid-header.tsx`
- `components/board/habit-tracker/habit-grid.tsx`
- `components/board/habit-tracker/month-picker.tsx`
- `components/board/habit-tracker/add-habit-button.tsx`
- `components/board/habit-tracker/add-habit-modal.tsx`

**Modify:**
- `prisma/schema.prisma` — add `HabitLog` model + `Habit.logs` relation
- `types/index.ts` — add `HabitLog` type
- `constants/query-keys.ts` — add `CACHE_KEY_HABIT_LOGS`
- `schema/board-schema.ts` — add `add_habit_schema`, `toggle_habit_log_schema`
- `actions/habit-tracker-board.actions.ts` — add `addHabit` action
- `store/board.store.ts` — add `add_habit` modal flag
- `app/layout.tsx` — wrap with `<NuqsAdapter>`
- `components/board/habit-tracker-board.tsx` — replace placeholder with full orchestrator

---

## Task 1: Add HabitLog Prisma model

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add the `logs HabitLog[]` relation to the existing `Habit` model**

In `prisma/schema.prisma`, modify the `Habit` model (currently lines 153-162) to add `logs`:

```prisma
model Habit {
  id        String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  theme     String     @default("#635FC7")
  goal      Int        @default(0)
  boardId   String     @db.Uuid
  board     Board      @relation(fields: [boardId], references: [id], onDelete: Cascade)
  logs      HabitLog[]
  createdAt DateTime   @default(now()) @db.Timestamp(6)
  updatedAt DateTime   @updatedAt @db.Timestamp(6)
}
```

- [ ] **Step 2: Append the new `HabitLog` model at the end of the schema**

Append at the end of `prisma/schema.prisma`:

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

- [ ] **Step 3: Run the migration**

Run: `npx prisma migrate dev --name add-habit-log`
Expected: Prisma creates a new migration directory under `prisma/migrations/`, applies it, and regenerates the client. No errors.

- [ ] **Step 4: Verify Prisma client regeneration**

Run: `npx tsc --noEmit`
Expected: PASS — no type errors. The `HabitLog` and `Habit.logs` types should now be present in `lib/generated/prisma/client`.

- [ ] **Step 5: Stage for review**

```bash
git add prisma/schema.prisma prisma/migrations/
```

Tell the user: "Schema + migration staged. Ready to commit?"

---

## Task 2: Add HabitLog type to types/index.ts

**Files:**
- Modify: `types/index.ts`

- [ ] **Step 1: Add the `HabitLog` type**

In `types/index.ts`, add the type. The full file should look like:

```ts
import type {
    Board as PrismaBoard,
    Column as PrismaColumn,
    Habit as PrismaHabit,
    Task as PrismaTask,
    Subtask as PrismaSubtask,
    User as PrismaUser,
    Tag as PrismaTag
} from "@/lib/generated/prisma/client";

export interface CallbackResponse<T = unknown> {
	onSuccess?: (data?: T) => void;
	onError?: (error_msg?: string) => void;
}

export type Board = Pick<PrismaBoard, "id" | "name" | "columnOrder" | "habitOrder" | "type"> & {
	columns?: Column[];
	habits?: Habit[];
	tags?: Tag[];
};

export type Column = Pick<PrismaColumn, "id" | "name" | "theme" | "taskOrder"> & {
	tasks?: Task[];
};

export type Habit = Pick<PrismaHabit, "id" | "name" | "theme" | "goal">;

export type HabitLog = {
	habitId: string;
	date: string;
};

export type Subtask = Pick<PrismaSubtask, "id" | "title" | "isCompleted">;

export type Tag = Pick<PrismaTag, "id" | "name" | "color">;

export type Task = Pick<PrismaTask, "id" | "title" | "isCompleted" | "subtaskOrder"> & {
	description: string;
	subtasks: Subtask[];
	tags: Tag[];
};

export type UserProfile = Pick<PrismaUser, "id" | "name" | "email" | "image" | "createdAt"> & {
	has_password: boolean;
	provider: string | null;
	stats: {
		total_boards: number;
		total_columns: number;
		total_tasks: number;
		total_subtasks: number;
		completed_subtasks: number;
		completion_rate: number;
	};
};
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add types/index.ts
```

---

## Task 3: Add CACHE_KEY_HABIT_LOGS constant

**Files:**
- Modify: `constants/query-keys.ts`

- [ ] **Step 1: Add the constant**

Replace the contents of `constants/query-keys.ts`:

```ts
export const CACHE_KEY_BOARDS = ["boards"];
export const CACHE_KEY_TASK_MANAGEMENT_BOARD = ["task-management-board"];
export const CACHE_KEY_HABIT_TRACKER_BOARD = ["habit-tracker-board"];
export const CACHE_KEY_HABIT_LOGS = ["habit-logs"];
export const CACHE_KEY_USER = ["user"];
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add constants/query-keys.ts
```

---

## Task 4: Add Zod schemas for add habit + toggle habit log

**Files:**
- Modify: `schema/board-schema.ts`

- [ ] **Step 1: Append `add_habit_schema` and `toggle_habit_log_schema`**

In `schema/board-schema.ts`, just before the type exports at the bottom, add:

```ts
export const add_habit_schema = z.object({
	board_id: z.string().uuid(),
	name: z.string().min(1, "Name is required"),
	theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
	goal: z.coerce.number().int().min(0, "Goal must be 0 or more").default(20)
});

export const toggle_habit_log_schema = z.object({
	habit_id: z.string().uuid(),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
});
```

- [ ] **Step 2: Append type exports**

In the same file, add after the existing exported types:

```ts
export type AddHabitSchema = z.infer<typeof add_habit_schema>;
export type ToggleHabitLogSchema = z.infer<typeof toggle_habit_log_schema>;
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Stage for review**

```bash
git add schema/board-schema.ts
```

---

## Task 5: Create date helpers

**Files:**
- Create: `lib/date-helpers.ts`

- [ ] **Step 1: Create the file**

Create `lib/date-helpers.ts` with this exact content:

```ts
/**
 * DOCU: Returns the current year-month in `YYYY-MM` format using local time. <br>
 * Triggered: As the default value for the `month` URL search param. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function currentYearMonth(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	return `${year}-${month}`;
}

/**
 * DOCU: Parses a `YYYY-MM` string into year and month_num (1-12). Falls back to current year-month if invalid. <br>
 * Triggered: When converting the `month` URL param into numeric values. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function parseYearMonth(value: string | null | undefined): { year: number; month_num: number } {
	if (value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
		const [year_str, month_str] = value.split("-");
		return { year: Number(year_str), month_num: Number(month_str) };
	}

	const now = new Date();
	return { year: now.getFullYear(), month_num: now.getMonth() + 1 };
}

/**
 * DOCU: Returns the number of days in a given year/month (month_num is 1-12). <br>
 * Triggered: When rendering the day columns of the habit grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function daysInMonth(year: number, month_num: number): number {
	return new Date(year, month_num, 0).getDate();
}

/**
 * DOCU: Formats a Date object as `YYYY-MM-DD` using local time. <br>
 * Triggered: When computing today's date or constructing day cell keys. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function formatLocalDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * DOCU: Builds a `YYYY-MM-DD` date string from year, month_num (1-12), and day. <br>
 * Triggered: When constructing per-cell date strings in the habit grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function buildDateString(year: number, month_num: number, day: number): string {
	const month = String(month_num).padStart(2, "0");
	const day_str = String(day).padStart(2, "0");
	return `${year}-${month}-${day_str}`;
}

/**
 * DOCU: Adds (or subtracts) months to a `YYYY-MM` string and returns the new `YYYY-MM`. <br>
 * Triggered: When the user clicks prev/next month buttons. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function addMonths(year_month: string, delta: number): string {
	const { year, month_num } = parseYearMonth(year_month);
	const date = new Date(year, month_num - 1 + delta, 1);
	const new_year = date.getFullYear();
	const new_month = String(date.getMonth() + 1).padStart(2, "0");
	return `${new_year}-${new_month}`;
}

/**
 * DOCU: Returns the weekday letter (M/T/W/T/F/S/S) for a given year/month/day. Day-of-week index is 0=Sun, 1=Mon, ..., 6=Sat. <br>
 * Triggered: When rendering the day-letter row of the habit grid header. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function getWeekdayLetter(year: number, month_num: number, day: number): string {
	const letters = ["S", "M", "T", "W", "T", "F", "S"];
	const date = new Date(year, month_num - 1, day);
	return letters[date.getDay()];
}

/**
 * DOCU: Formats a `YYYY-MM` string as a human-readable label (e.g., "March, 2021"). <br>
 * Triggered: In the month picker header display. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export function formatYearMonthLabel(year_month: string): string {
	const { year, month_num } = parseYearMonth(year_month);
	const month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	return `${month_names[month_num - 1]}, ${year}`;
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add lib/date-helpers.ts
```

---

## Task 6: Create habit-log server actions

**Files:**
- Create: `actions/habit-log.actions.ts`

- [ ] **Step 1: Create the file**

Create `actions/habit-log.actions.ts` with this exact content:

```ts
"use server";

/* UTILITIES */
import prisma from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";

/* SCHEMA */
import { toggle_habit_log_schema } from "@/schema/board-schema";

/* TYPES */
import type { HabitLog } from "@/types";

/**
 * DOCU: Fetches all habit logs for a board within a given year/month. Date strings are returned as `YYYY-MM-DD`. <br>
 * Triggered: When the habit-tracker board renders or the visible month changes. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export async function getHabitLogsForBoard(board_id: string, year: number, month_num: number): Promise<HabitLog[]> {
	const start_date = new Date(Date.UTC(year, month_num - 1, 1));
	const end_date = new Date(Date.UTC(year, month_num, 1));

	const logs = await prisma.habitLog.findMany({
		where: {
			habit: { boardId: board_id },
			date: { gte: start_date, lt: end_date }
		},
		select: { habitId: true, date: true }
	});

	return logs.map((log) => ({
		habitId: log.habitId,
		date: log.date.toISOString().slice(0, 10)
	}));
}

/**
 * DOCU: Toggles a habit log for a given habit and date. Creates if missing, deletes if present. <br>
 * Triggered: When the user clicks a day cell in the habit grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const toggleHabitLogAction = authActionClient
	.schema(toggle_habit_log_schema)
	.action(async ({ parsedInput }) => {
		const { habit_id, date } = parsedInput;
		const date_obj = new Date(`${date}T00:00:00.000Z`);

		const existing = await prisma.habitLog.findUnique({
			where: { habitId_date: { habitId: habit_id, date: date_obj } }
		});

		if (existing) {
			await prisma.habitLog.delete({
				where: { habitId_date: { habitId: habit_id, date: date_obj } }
			});
			return { habitId: habit_id, date, completed: false };
		}

		await prisma.habitLog.create({
			data: { habitId: habit_id, date: date_obj }
		});
		return { habitId: habit_id, date, completed: true };
	});
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add actions/habit-log.actions.ts
```

---

## Task 7: Add `addHabitAction` to habit-tracker-board actions

**Files:**
- Modify: `actions/habit-tracker-board.actions.ts`

- [ ] **Step 1: Add the action**

In `actions/habit-tracker-board.actions.ts`, add the import for `add_habit_schema` and append the new action.

Update the schema import at the top:

```ts
/* SCHEMA */
import { add_habit_schema, edit_habit_board_schema } from "@/schema/board-schema";
```

Append at the end of the file:

```ts
/**
 * DOCU: Creates a new habit on a habit-tracker board and appends it to habitOrder. <br>
 * Triggered: On submission of the Add Habit modal. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const addHabitAction = authActionClient
	.schema(add_habit_schema)
	.action(async ({ parsedInput, ctx }) => {
		const { board_id, name, theme, goal } = parsedInput;

		const habit = await prisma.$transaction(async (tx) => {
			const new_habit = await tx.habit.create({
				data: { name, theme, goal, boardId: board_id }
			});

			await tx.board.update({
				where: { id: board_id, userId: ctx.userId },
				data: { habitOrder: { push: new_habit.id } }
			});

			return new_habit;
		});

		return {
			id: habit.id,
			name: habit.name,
			theme: habit.theme,
			goal: habit.goal,
			board_id
		};
	});
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add actions/habit-tracker-board.actions.ts
```

---

## Task 8: Create habit-log query hook

**Files:**
- Create: `hooks/queries/habit-log.query.ts`

- [ ] **Step 1: Create the file**

Create `hooks/queries/habit-log.query.ts`:

```ts
/* PLUGINS */
import { useQuery } from "@tanstack/react-query";

/* ACTIONS */
import { getHabitLogsForBoard } from "@/actions/habit-log.actions";

/* CONSTANTS */
import { CACHE_KEY_HABIT_LOGS } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants";

/**
 * DOCU: Reads all habit logs for the current board and visible month. <br>
 * Triggered: From the habit-tracker board orchestrator on render and month change. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const useGetHabitLogs = (board_id?: string, year?: number, month_num?: number) => {
	const { data: logs, ...rest } = useQuery({
		queryKey: [...CACHE_KEY_HABIT_LOGS, board_id, year, month_num],
		queryFn: () => getHabitLogsForBoard(board_id!, year!, month_num!),
		staleTime: STALE_TIME,
		enabled: !!board_id && !!year && !!month_num
	});

	return { logs: logs ?? [], ...rest };
};
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add hooks/queries/habit-log.query.ts
```

---

## Task 9: Create habit-log toggle mutation hook (with optimistic update)

**Files:**
- Create: `hooks/mutations/habit-log.mutation.ts`

- [ ] **Step 1: Create the file**

Create `hooks/mutations/habit-log.mutation.ts`:

```ts
/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/* ACTIONS */
import { toggleHabitLogAction } from "@/actions/habit-log.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* CONSTANTS */
import { CACHE_KEY_HABIT_LOGS } from "@/constants/query-keys";

/* SCHEMA */
import { ToggleHabitLogSchema } from "@/schema/board-schema";

/* TYPES */
import { HabitLog } from "@/types";

/**
 * DOCU: Toggles a habit log on a given date with optimistic cache update + rollback on failure. <br>
 * Triggered: When the user clicks a day cell in the habit grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const useToggleHabitLog = (board_id: string, year: number, month_num: number) => {
	const queryClient = useQueryClient();
	const queryKey = [...CACHE_KEY_HABIT_LOGS, board_id, year, month_num];

	const { mutate: toggleHabitLog, ...rest } = useMutation({
		mutationFn: (payload: ToggleHabitLogSchema) => executeAction(toggleHabitLogAction(payload)),
		onMutate: async (payload) => {
			await queryClient.cancelQueries({ queryKey });
			const previous_logs = queryClient.getQueryData<HabitLog[]>(queryKey);

			queryClient.setQueryData<HabitLog[]>(queryKey, (logs) => {
				if (!logs) return logs;
				const exists = logs.some((log) => log.habitId === payload.habit_id && log.date === payload.date);
				if (exists) {
					return logs.filter((log) => !(log.habitId === payload.habit_id && log.date === payload.date));
				}
				return [...logs, { habitId: payload.habit_id, date: payload.date }];
			});

			return { previous_logs };
		},
		onError: (_, __, context) => {
			if (context?.previous_logs) {
				queryClient.setQueryData(queryKey, context.previous_logs);
			}
			toast.error("Failed to update habit. Please try again.");
		}
	});

	return { toggleHabitLog, ...rest };
};
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add hooks/mutations/habit-log.mutation.ts
```

---

## Task 10: Create add-habit mutation hook

**Files:**
- Create: `hooks/mutations/habit.mutation.ts`

- [ ] **Step 1: Create the file**

Create `hooks/mutations/habit.mutation.ts`:

```ts
/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/* ACTIONS */
import { addHabitAction } from "@/actions/habit-tracker-board.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* CONSTANTS */
import { CACHE_KEY_HABIT_TRACKER_BOARD } from "@/constants/query-keys";

/* SCHEMA */
import { AddHabitSchema } from "@/schema/board-schema";

/* TYPES */
import { Board, CallbackResponse, Habit } from "@/types";

/**
 * DOCU: Creates a new habit on a board and appends it to the board's habit list in the cache. <br>
 * Triggered: On submission of the Add Habit modal. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const useAddHabit = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: addHabit, ...rest } = useMutation({
		mutationFn: (payload: AddHabitSchema) => executeAction(addHabitAction(payload)),
		onSuccess: (response) => {
			if (response) {
				const new_habit: Habit = { id: response.id, name: response.name, theme: response.theme, goal: response.goal };

				queryClient.setQueryData<Board>([...CACHE_KEY_HABIT_TRACKER_BOARD, response.board_id], (board) => {
					if (!board) return board;
					return {
						...board,
						habits: [...(board.habits ?? []), new_habit],
						habitOrder: [...board.habitOrder, response.id]
					};
				});

				toast.success("Habit added successfully.");
				callback?.onSuccess?.();
			}
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
			callback?.onError?.();
		}
	});

	return { addHabit, ...rest };
};
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add hooks/mutations/habit.mutation.ts
```

---

## Task 11: Add `add_habit` modal flag to board store

**Files:**
- Modify: `store/board.store.ts`

- [ ] **Step 1: Replace the file contents**

Replace `store/board.store.ts` with:

```ts
/* PLUGINS */
import { create } from "zustand";

/* TYPES */
import { Board } from "@/types";

interface Modals {
	add_board: boolean;
	edit_board: boolean;
	edit_tags: boolean;
	delete_board: boolean;
	add_habit: boolean;
}

interface BoardStore {
	modals: Modals;
	selected_board: Board | null;
	setModal: (modal: keyof Modals, value: boolean) => void;
	setSelectedBoard: (board: Board | null) => void;
}

export const useBoardStore = create<BoardStore>()((set) => ({
	modals: {
		add_board: false,
		edit_board: false,
		edit_tags: false,
		delete_board: false,
		add_habit: false
	},
	selected_board: null,
	setModal: (modal, value) =>
		set((state) => ({
			modals: {
				...state.modals,
				[modal]: value
			}
		})),
	setSelectedBoard: (selected_board) => set({ selected_board })
}));
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add store/board.store.ts
```

---

## Task 12: Install nuqs and wrap the layout

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `app/layout.tsx`

- [ ] **Step 1: Install nuqs**

Run: `npm install nuqs`
Expected: nuqs added to dependencies. No peer-dep warnings beyond the usual.

- [ ] **Step 2: Wrap RootLayout's body in `<NuqsAdapter>`**

Replace `app/layout.tsx` with:

```tsx
/* NEXT */
import type { Metadata } from "next";

/* COMPONENTS */
import Providers from "@/components/providers";

/* PLUGINS */
import { Plus_Jakarta_Sans } from "next/font/google";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";

/* STYLES */
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
	variable: "--font-jakarta",
	subsets: ["latin"],
	weight: ["200", "300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
	title: "Kanban Task Management",
	description: "Kanban Task Management"
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${jakarta.variable} bg-background flex flex-col gap-[16] min-h-screen`}
			>
				<NuqsAdapter>
					<Providers>
						{children}
						<ReactQueryDevtools initialIsOpen={false} />
					</Providers>
				</NuqsAdapter>
			</body>
		</html>
	);
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Stage for review**

```bash
git add package.json package-lock.json app/layout.tsx
```

---

## Task 13: Build `HabitCell` (single day cell)

**Files:**
- Create: `components/board/habit-tracker/habit-cell.tsx`

- [ ] **Step 1: Create the component**

Create `components/board/habit-tracker/habit-cell.tsx`:

```tsx
"use client";

/* ICONS */
import { FaCheck } from "react-icons/fa6";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	is_logged: boolean;
	is_today: boolean;
	theme: string;
	onClick: () => void;
}

/**
 * DOCU: Single day cell in the habit tracker grid. Shows a check when logged; theme-tinted when logged (except for today's column which stays white). <br>
 * Triggered: For every (habit, day) pair in the visible month. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const HabitCell = ({ is_logged, is_today, theme, onClick }: Props) => {
	const background = is_logged && !is_today ? `${theme}40` : undefined;
	const hover_background = !is_logged && !is_today ? `${theme}1A` : undefined;

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"size-[32] flex items-center justify-center cursor-pointer border-r border-b border-lines-light dark:border-lines-dark transition-colors",
				is_today && "bg-foreground/0"
			)}
			style={{
				backgroundColor: background,
				// @ts-expect-error CSS custom property for hover
				"--hover-bg": hover_background
			}}
			onMouseEnter={(e) => {
				if (hover_background) e.currentTarget.style.backgroundColor = hover_background;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = background ?? "";
			}}
			aria-label={is_logged ? "Mark as not done" : "Mark as done"}
		>
			{is_logged && (
				<FaCheck
					className="size-[12]"
					style={{ color: is_today ? theme : "#1a1a1a" }}
				/>
			)}
		</button>
	);
};

export default HabitCell;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add components/board/habit-tracker/habit-cell.tsx
```

---

## Task 14: Build `HabitRow`

**Files:**
- Create: `components/board/habit-tracker/habit-row.tsx`

- [ ] **Step 1: Create the component**

Create `components/board/habit-tracker/habit-row.tsx`:

```tsx
"use client";

/* COMPONENTS */
import HabitCell from "@/components/habit-tracker/habit-cell";

/* UTILITIES */
import { buildDateString } from "@/lib/date-helpers";
import { cn } from "@/lib/utils";

/* TYPES */
import { Habit } from "@/types";

interface Props {
	habit: Habit;
	year: number;
	month_num: number;
	days_count: number;
	today_iso: string | null;
	logged_set: Set<string>;
	achieved: number;
	onToggle: (habit_id: string, date: string) => void;
}

/**
 * DOCU: Renders a single habit row: name (sticky left), one cell per day in the month, goal cell, achieved cell (sticky right). <br>
 * Triggered: For each habit in the habit-tracker grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const HabitRow = ({ habit, year, month_num, days_count, today_iso, logged_set, achieved, onToggle }: Props) => {
	const days = Array.from({ length: days_count }, (_, idx) => idx + 1);
	const goal_met = achieved >= habit.goal;

	return (
		<div className="contents">
			<div className="sticky left-0 bg-foreground z-10 flex items-center px-[12] border-r border-b border-lines-light dark:border-lines-dark text-body-md whitespace-nowrap">
				{habit.name}
			</div>

			{days.map((day) => {
				const date = buildDateString(year, month_num, day);
				const is_logged = logged_set.has(`${habit.id}-${date}`);
				const is_today = date === today_iso;
				return (
					<HabitCell
						key={date}
						is_logged={is_logged}
						is_today={is_today}
						theme={habit.theme}
						onClick={() => onToggle(habit.id, date)}
					/>
				);
			})}

			<div className="sticky right-[80] bg-foreground z-10 flex items-center justify-center border-l border-r border-b border-lines-light dark:border-lines-dark text-body-md">
				{habit.goal}
			</div>
			<div
				className={cn(
					"sticky right-0 z-10 flex items-center justify-center border-b border-lines-light dark:border-lines-dark text-body-md font-bold",
					goal_met ? "bg-green-500 text-white" : "bg-yellow-400 text-foreground"
				)}
			>
				{achieved}
			</div>
		</div>
	);
};

export default HabitRow;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add components/board/habit-tracker/habit-row.tsx
```

---

## Task 15: Build `HabitGridHeader`

**Files:**
- Create: `components/board/habit-tracker/habit-grid-header.tsx`

- [ ] **Step 1: Create the component**

Create `components/board/habit-tracker/habit-grid-header.tsx`:

```tsx
"use client";

/* UTILITIES */
import { buildDateString, getWeekdayLetter } from "@/lib/date-helpers";
import { cn } from "@/lib/utils";

interface Props {
	year: number;
	month_num: number;
	days_count: number;
	today_iso: string | null;
}

/**
 * DOCU: Renders the header row of the habit grid: "Habits" label, weekday letter + day number for each day, "Goal", "Achieved". Today's column is highlighted with a black background. <br>
 * Triggered: As the first row of HabitGrid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const HabitGridHeader = ({ year, month_num, days_count, today_iso }: Props) => {
	const days = Array.from({ length: days_count }, (_, idx) => idx + 1);

	return (
		<div className="contents">
			<div className="sticky left-0 bg-foreground z-20 flex items-center justify-center px-[12] py-[12] border-r border-b border-lines-light dark:border-lines-dark text-primary text-body-md font-bold">
				Habits
			</div>

			{days.map((day) => {
				const date = buildDateString(year, month_num, day);
				const is_today = date === today_iso;
				return (
					<div
						key={date}
						className={cn(
							"flex flex-col items-center justify-center py-[8] border-r border-b border-lines-light dark:border-lines-dark text-body-sm",
							is_today && "bg-foreground"
						)}
					>
						<span className={cn("text-medium-grey", is_today && "text-white bg-black px-[4] rounded-sm")}>
							{getWeekdayLetter(year, month_num, day)}
						</span>
						<span className={cn("font-bold", is_today && "text-white bg-black w-full text-center")}>
							{day}
						</span>
					</div>
				);
			})}

			<div className="sticky right-[80] bg-foreground z-20 flex items-center justify-center border-l border-r border-b border-lines-light dark:border-lines-dark text-primary text-body-md font-bold">
				Goal
			</div>
			<div className="sticky right-0 bg-foreground z-20 flex items-center justify-center border-b border-lines-light dark:border-lines-dark text-primary text-body-md font-bold">
				Achieved
			</div>
		</div>
	);
};

export default HabitGridHeader;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add components/board/habit-tracker/habit-grid-header.tsx
```

---

## Task 16: Build `HabitGrid`

**Files:**
- Create: `components/board/habit-tracker/habit-grid.tsx`

- [ ] **Step 1: Create the component**

Create `components/board/habit-tracker/habit-grid.tsx`:

```tsx
"use client";

/* COMPONENTS */
import HabitGridHeader from "@/components/habit-tracker/habit-grid-header";
import HabitRow from "@/components/habit-tracker/habit-row";

/* TYPES */
import { Habit, HabitLog } from "@/types";

interface Props {
	habits: Habit[];
	logs: HabitLog[];
	year: number;
	month_num: number;
	days_count: number;
	today_iso: string | null;
	onToggle: (habit_id: string, date: string) => void;
}

/**
 * DOCU: The habit-tracker grid: header + one row per habit. Wrapped in a horizontally scrollable container with sticky left (Habits) and right (Goal, Achieved) columns. <br>
 * Triggered: From the habit-tracker board orchestrator when habits and logs are available. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const HabitGrid = ({ habits, logs, year, month_num, days_count, today_iso, onToggle }: Props) => {
	const logged_set = new Set(logs.map((log) => `${log.habitId}-${log.date}`));
	const achieved_by_habit = new Map<string, number>();
	for (const log of logs) {
		achieved_by_habit.set(log.habitId, (achieved_by_habit.get(log.habitId) ?? 0) + 1);
	}

	const grid_template_columns = `160px repeat(${days_count}, 32px) 64px 80px`;

	return (
		<div className="overflow-x-auto border border-lines-light dark:border-lines-dark rounded-md">
			<div
				className="grid"
				style={{ gridTemplateColumns: grid_template_columns }}
			>
				<HabitGridHeader year={year} month_num={month_num} days_count={days_count} today_iso={today_iso} />

				{habits.map((habit) => (
					<HabitRow
						key={habit.id}
						habit={habit}
						year={year}
						month_num={month_num}
						days_count={days_count}
						today_iso={today_iso}
						logged_set={logged_set}
						achieved={achieved_by_habit.get(habit.id) ?? 0}
						onToggle={onToggle}
					/>
				))}
			</div>
		</div>
	);
};

export default HabitGrid;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add components/board/habit-tracker/habit-grid.tsx
```

---

## Task 17: Build `MonthPicker`

**Files:**
- Create: `components/board/habit-tracker/month-picker.tsx`

- [ ] **Step 1: Create the component**

Create `components/board/habit-tracker/month-picker.tsx`:

```tsx
"use client";

/* COMPONENTS */
import { Button } from "@/components/ui/button";

/* ICONS */
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

/* UTILITIES */
import { addMonths, formatYearMonthLabel } from "@/lib/date-helpers";

interface Props {
	year_month: string;
	onChange: (year_month: string) => void;
}

/**
 * DOCU: Month picker header with prev/next chevrons and the current "Month, Year" label. <br>
 * Triggered: At the top of the habit-tracker board. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const MonthPicker = ({ year_month, onChange }: Props) => {
	return (
		<div className="flex items-center justify-center gap-[16] py-[12]">
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={() => onChange(addMonths(year_month, -1))}
				aria-label="Previous month"
			>
				<FaChevronLeft />
			</Button>
			<span className="text-primary text-h-md font-bold">{formatYearMonthLabel(year_month)}</span>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={() => onChange(addMonths(year_month, 1))}
				aria-label="Next month"
			>
				<FaChevronRight />
			</Button>
		</div>
	);
};

export default MonthPicker;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add components/board/habit-tracker/month-picker.tsx
```

---

## Task 18: Build `AddHabitButton` ("+ New Habit")

**Files:**
- Create: `components/board/habit-tracker/add-habit-button.tsx`

- [ ] **Step 1: Create the component**

Create `components/board/habit-tracker/add-habit-button.tsx`:

```tsx
"use client";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/**
 * DOCU: "+ New Habit" link rendered below the habit grid. Opens the AddHabitModal via the board store. <br>
 * Triggered: From the habit-tracker board layout. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const AddHabitButton = () => {
	const setModal = useBoardStore((state) => state.setModal);

	return (
		<button
			type="button"
			onClick={() => setModal("add_habit", true)}
			className="text-medium-grey hover:text-primary transition-colors text-body-md font-bold cursor-pointer"
		>
			+ New Habit
		</button>
	);
};

export default AddHabitButton;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add components/board/habit-tracker/add-habit-button.tsx
```

---

## Task 19: Build `AddHabitModal`

**Files:**
- Create: `components/board/habit-tracker/add-habit-modal.tsx`

- [ ] **Step 1: Create the component**

Create `components/board/habit-tracker/add-habit-modal.tsx`:

```tsx
"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useEffect } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ColorPicker from "@/components/ui/color-picker";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

/* SCHEMA */
import { add_habit_schema, AddHabitSchema } from "@/schema/board-schema";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* MUTATIONS */
import { useAddHabit } from "@/hooks/mutations/habit.mutation";

/* CONSTANTS */
import { DEFAULT_COLUMN_THEME } from "@/constants";

/**
 * DOCU: Single-habit creation modal. Reads board_id from the URL params; submits to addHabitAction. <br>
 * Triggered: When the user clicks "+ New Habit" below the habit grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const AddHabitModal = () => {
	const { board_id } = useParams() as { board_id: string };
	const modals = useBoardStore((state) => state.modals);
	const setModal = useBoardStore((state) => state.setModal);

	const form = useForm<AddHabitSchema>({
		resolver: zodResolver(add_habit_schema),
		defaultValues: {
			board_id,
			name: "",
			theme: DEFAULT_COLUMN_THEME,
			goal: 20
		}
	});

	const errors = form.formState.errors;

	const { addHabit, isPending } = useAddHabit({
		onSuccess: () => {
			setModal("add_habit", false);
		}
	});

	useEffect(() => {
		if (modals.add_habit) {
			form.reset({ board_id, name: "", theme: DEFAULT_COLUMN_THEME, goal: 20 });
		}
	}, [modals.add_habit, board_id, form]);

	const onSubmit: SubmitHandler<AddHabitSchema> = (data) => {
		addHabit(data);
	};

	return (
		<Dialog open={modals.add_habit} onOpenChange={(value) => !isPending && setModal("add_habit", value)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg">Add Habit</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form className="flex flex-col gap-[24]" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Habit Name</FormLabel>
									<Input
										{...field}
										type="text"
										placeholder="e.g. Journal"
										error={errors.name?.message}
									/>
								</FormItem>
							)}
						/>

						<FormItem>
							<FormLabel>Theme</FormLabel>
							<Controller
								control={form.control}
								name="theme"
								render={({ field }) => (
									<ColorPicker
										value={field.value || DEFAULT_COLUMN_THEME}
										onChange={field.onChange}
										disabled={isPending}
									/>
								)}
							/>
						</FormItem>

						<FormField
							control={form.control}
							name="goal"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Goal (days per month)</FormLabel>
									<Input
										{...field}
										type="number"
										min={0}
										placeholder="20"
										error={errors.goal?.message}
									/>
								</FormItem>
							)}
						/>

						<div className="flex flex-col gap-[12]">
							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending ? "Adding..." : "Add Habit"}
							</Button>
							<Button type="button" variant="secondary" className="w-full" disabled={isPending} onClick={() => setModal("add_habit", false)}>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default AddHabitModal;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add components/board/habit-tracker/add-habit-modal.tsx
```

---

## Task 20: Replace `HabitTrackerBoard` with the orchestrator

**Files:**
- Modify: `components/board/habit-tracker-board.tsx`

- [ ] **Step 1: Replace the file contents**

Replace `components/board/habit-tracker-board.tsx` with:

```tsx
"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* COMPONENTS */
import EditHabitBoardModal from "@/components/board/edit-habit-board-modal";
import DeleteBoardModal from "@/components/board/delete-board-modal";
import AddHabitModal from "@/components/habit-tracker/add-habit-modal";
import MonthPicker from "@/components/habit-tracker/month-picker";
import HabitGrid from "@/components/habit-tracker/habit-grid";
import AddHabitButton from "@/components/habit-tracker/add-habit-button";

/* PLUGINS */
import { parseAsString, useQueryState } from "nuqs";

/* QUERIES */
import { useGetHabitTrackerBoard } from "@/hooks/queries/habit-tracker-board.query";
import { useGetHabitLogs } from "@/hooks/queries/habit-log.query";

/* MUTATIONS */
import { useToggleHabitLog } from "@/hooks/mutations/habit-log.mutation";

/* UTILITIES */
import { currentYearMonth, daysInMonth, formatLocalDate, parseYearMonth } from "@/lib/date-helpers";

/**
 * DOCU: Habit-tracker board orchestrator. Reads month from URL (nuqs), fetches habits + logs, renders MonthPicker, HabitGrid, AddHabitButton, and modals. <br>
 * Triggered: On the habit-tracker board detail page. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const HabitTrackerBoard = () => {
	const { board_id } = useParams() as { board_id: string };
	const [year_month, setYearMonth] = useQueryState("month", parseAsString.withDefault(currentYearMonth()));
	const { year, month_num } = parseYearMonth(year_month);
	const days_count = daysInMonth(year, month_num);
	const today_iso = formatLocalDate(new Date());

	const { board } = useGetHabitTrackerBoard(board_id);
	const { logs } = useGetHabitLogs(board_id, year, month_num);
	const { toggleHabitLog } = useToggleHabitLog(board_id, year, month_num);

	const habits = board?.habits ?? [];

	const handleToggle = (habit_id: string, date: string) => {
		toggleHabitLog({ habit_id, date });
	};

	return (
		<div className="p-[24] flex flex-col gap-[16]">
			<MonthPicker year_month={year_month} onChange={setYearMonth} />

			<HabitGrid
				habits={habits}
				logs={logs}
				year={year}
				month_num={month_num}
				days_count={days_count}
				today_iso={today_iso}
				onToggle={handleToggle}
			/>

			<div className="px-[8]">
				<AddHabitButton />
			</div>

			{/* MODALS */}
			<EditHabitBoardModal />
			<DeleteBoardModal />
			<AddHabitModal />
		</div>
	);
};

export default HabitTrackerBoard;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Stage for review**

```bash
git add components/board/habit-tracker-board.tsx
```

---

## Task 21: Manual browser verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Server starts on http://localhost:3000.

- [ ] **Step 2: Open a habit-tracker board in the browser**

Navigate to a habit-tracker board (`/habits/<board_id>`).

Verify:
- URL updates to `?month=YYYY-MM` (current month) on first render
- Month picker header shows e.g., "April, 2026" with prev/next chevrons
- Grid renders with all habits as rows and day columns spanning the month
- Today's column header has a black background; day number is white-on-black
- Habits column (left) and Goal/Achieved columns (right) stay sticky on horizontal scroll

- [ ] **Step 3: Toggle cells**

- Click any day cell — checkmark appears with theme tint, no perceptible delay
- Click again — cell clears
- Refresh the page — toggled state persists

- [ ] **Step 4: Goal/Achieved coloring**

- For a habit where `achieved >= goal`: Achieved cell is green
- For a habit where `achieved < goal`: Achieved cell is yellow

- [ ] **Step 5: Month navigation**

- Click prev — URL updates, day grid changes, logs refetch
- Click next twice — same behavior
- Refresh the page on a non-current month — month persists from URL

- [ ] **Step 6: Add a habit**

- Click "+ New Habit" below the grid
- AddHabitModal opens
- Fill in name/theme/goal, submit
- Modal closes, new habit appears as the last row in the grid
- Toast: "Habit added successfully"

- [ ] **Step 7: Existing flows still work**

- Edit Board (navbar action) opens EditHabitBoardModal
- Delete Board (navbar action) opens DeleteBoardModal with the habit-specific description
- Both modals function the same as before

- [ ] **Step 8: Empty state**

- Edit a habit-tracker board to remove all habits, save
- Verify the grid shows only the day-header row and the "+ New Habit" prompt below

- [ ] **Step 9: Final type check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 10: Final stage**

If any minor adjustments were made during browser testing, stage them:
```bash
git add -A
```

Tell the user: "Implementation complete. All staged for review. Ready to commit?"

---

## Self-Review Notes

**Spec coverage:**
- HabitLog model — Task 1 ✓
- HabitLog type — Task 2 ✓
- CACHE_KEY_HABIT_LOGS — Task 3 ✓
- Schemas (add_habit, toggle_habit_log) — Task 4 ✓
- Date helpers — Task 5 ✓
- Server actions (getHabitLogsForBoard, toggleHabitLogAction) — Task 6 ✓
- addHabitAction — Task 7 ✓
- Query/mutation hooks — Tasks 8, 9, 10 ✓
- board.store add_habit flag — Task 11 ✓
- nuqs install + adapter — Task 12 ✓
- HabitCell — Task 13 ✓
- HabitRow (with goal/achieved) — Task 14 ✓
- HabitGridHeader (today highlight) — Task 15 ✓
- HabitGrid (grid layout, achieved computation) — Task 16 ✓
- MonthPicker — Task 17 ✓
- AddHabitButton — Task 18 ✓
- AddHabitModal — Task 19 ✓
- Orchestrator — Task 20 ✓
- Manual verification (acceptance criteria) — Task 21 ✓

**Type consistency:**
- `HabitLog = { habitId: string; date: string }` — used in actions, hooks, components consistently
- `toggle_habit_log_schema` uses `habit_id` (snake_case) for payload — `useToggleHabitLog` payload type matches via `ToggleHabitLogSchema`
- `add_habit_schema` uses `board_id`/`name`/`theme`/`goal` — `addHabitAction` returns `{ id, name, theme, goal, board_id }`, `useAddHabit` cache update uses these
- `useToggleHabitLog(board_id, year, month_num)` signature matches usage in orchestrator
