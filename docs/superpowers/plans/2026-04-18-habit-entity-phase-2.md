# Habit Entity (Phase 2) Implementation Plan

> **For agentic workers:** Subagent-driven execution. Steps use checkbox syntax.

**Goal:** Persist habits at board-creation time for `HABIT_TRACKER` boards (name + theme + monthly goal), and refactor the create-board modal so each board type's form fields live in their own component via a `BOARD_FIELDS` lookup map.

**Architecture:** New Prisma `Habit` model (cascade from Board). `Board` gains `habitOrder String[]`. Zod `add_board_schema` gains an optional `habits` array with a per-item `habit_schema`. `createBoardAction` branches on type. The create-board modal becomes a shell that renders either `<TaskManagementFields />` or `<HabitTrackerFields />` looked up from a map, matching the `BOARD_VIEWS` pattern on the detail page.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Prisma 7, Zod, react-hook-form, shadcn/ui, `@dnd-kit/react`.

**Spec:** `docs/superpowers/specs/2026-04-18-habit-entity-phase-2-design.md`

---

## Notes for Implementers

- **No test framework** — follow manual verification steps (type check, build, optional browser smoke).
- **Do not commit.** User reviews all diffs before any commit. Every task ends with `git status` + suggested commit message.
- **No worktrees or new branches.** Stay on `feature/filters`.
- **Use today's date — April 18, 2026 — for new JSDoc `Last Updated` lines.**
- Enum value for task management is `TASK_MANAGEMENT` (renamed from `KANBAN` in the last iteration).
- Use `react-icons`, not `lucide-react`, for any new icons.
- File names are kebab-case; component exports are PascalCase.

---

## File Inventory

| File | Change | Responsibility |
|------|--------|----------------|
| `prisma/schema.prisma` | Modify | Add `Habit` model; add `habitOrder` + `habits` on `Board` |
| `prisma/migrations/<ts>_add_habit_entity/migration.sql` | Create (generated) | DDL for new table and column |
| `schema/board-schema.ts` | Modify | `MAX_HABITS`, `habit_schema`, `habits` on `add_board_schema` |
| `types/index.ts` | Modify | `Habit` type; extend `Board` with `habitOrder` + `habits?` |
| `actions/board.actions.ts` | Modify | `createBoardAction` branches on type; `getBoardById` + `editBoardAction` include habits |
| `components/board/task-management-fields.tsx` | Create | Columns field-array + drag UI (extracted from modal) |
| `components/board/habit-tracker-fields.tsx` | Create | Habits field-array + drag UI + goal input |
| `components/board/create-board-modal.tsx` | Modify | Remove columns logic; use `BOARD_FIELDS` lookup |

---

## Task 1: Prisma schema + migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<ts>_add_habit_entity/migration.sql`

- [ ] **Step 1.1: Add `habitOrder` + `habits` relation to `Board` and create the `Habit` model**

In `prisma/schema.prisma`, update the `Board` model. Add `habitOrder` right after `columnOrder`, and `habits` right after `columns`. The `Board` model becomes:

```prisma
model Board {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String
  type        BoardType @default(TASK_MANAGEMENT)
  columnOrder String[]  @default([]) @db.Uuid
  habitOrder  String[]  @default([]) @db.Uuid
  userId      String    @db.Uuid
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  columns     Column[]
  habits      Habit[]
  createdAt   DateTime  @default(now()) @db.Timestamp(6)
  updatedAt   DateTime  @updatedAt @db.Timestamp(6)
  tags        Tag[]
}
```

Immediately after the `Column` model (or after the `Subtask` model — anywhere near the other content models), add:

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

Run `npx prisma format` to auto-align columns.

- [ ] **Step 1.2: Generate and apply the migration**

Run `npx prisma migrate dev --name add_habit_entity`.

If drift blocks `migrate dev` (same situation as last time), use the `db push` + manual `migration.sql` + `migrate resolve --applied` workaround. The SQL must include:

```sql
-- AlterTable
ALTER TABLE "Board" ADD COLUMN "habitOrder" UUID[] DEFAULT ARRAY[]::UUID[];

-- CreateTable
CREATE TABLE "Habit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT '#635FC7',
    "goal" INTEGER NOT NULL DEFAULT 0,
    "boardId" UUID NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

- [ ] **Step 1.3: Verify DB state**

Use `npx prisma db execute --file <tempfile>` or a small Node script to confirm:
1. The `Habit` table exists and is empty.
2. Existing `Board` rows now have `habitOrder = '{}'` (empty array).

Do NOT open Prisma Studio (it opens a browser and blocks).

- [ ] **Step 1.4: Type check**

Run `npx tsc --noEmit`. Expected: no errors in schema/Prisma code. Downstream type errors may surface in `actions/board.actions.ts` and `types/index.ts` — those resolve in Tasks 3 and 4.

- [ ] **Step 1.5: Review with user**

Run `git status` and `git diff prisma/schema.prisma`. Report: "Task 1 complete. Habit model and habitOrder added, migration applied. Existing boards got empty habitOrder. Suggested commit message: `feat(db): add Habit model and Board.habitOrder`. Not committed."

---

## Task 2: Zod schema additions

**File:** `schema/board-schema.ts`

- [ ] **Step 2.1: Add `MAX_HABITS`, `habit_schema`, and `habits` field on `add_board_schema`**

Replace the file contents with:

```ts
import { z } from "zod";

/* SCHEMA */
import { MAX_BOARD_TAGS } from "@/schema/tag-schema";

export const MAX_COLUMNS = 10;
export const MAX_HABITS = 10;

export const BOARD_TYPES = ["TASK_MANAGEMENT", "HABIT_TRACKER"] as const;
export const board_type_schema = z.enum(BOARD_TYPES);

export const habit_schema = z.object({
	name: z.string().min(1, "Can't be empty"),
	theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
	goal: z.coerce.number().int().min(0, "Goal must be 0 or more").default(0)
});

export const add_board_schema = z.object({
	name: z.string().min(1, "Name is required"),
	type: board_type_schema.default("TASK_MANAGEMENT"),
	columns: z.array(z.object({
		name: z.string().min(1, "Can't be empty"),
		theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
	})).max(MAX_COLUMNS, `You can only have up to ${MAX_COLUMNS} columns`).optional(),
	habits: z.array(habit_schema).max(MAX_HABITS, `You can only have up to ${MAX_HABITS} habits`).optional()
});

export const edit_board_schema = z.object({
	id: z.string(),
	name: z.string().min(1, "Name is required"),
	columns: z.array(z.object({
		id: z.string().optional(),
		name: z.string().min(1, "Can't be empty"),
		theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
		is_new: z.boolean().default(false).optional()
	})).max(MAX_COLUMNS, `You can only have up to ${MAX_COLUMNS} columns`),
	tags: z.array(z.object({
		id: z.string().optional(),
		name: z.string().min(1, "Can't be empty"),
		color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
		is_new: z.boolean().default(false).optional()
	})).max(MAX_BOARD_TAGS, `You can only have up to ${MAX_BOARD_TAGS} tags`).optional()
});

export const delete_board_schema = z.object({
	id: z.string()
});

export const reorder_board_schema = z.object({
	updated_board_order: z.array(z.string())
});

export type BoardType = z.infer<typeof board_type_schema>;
export type HabitSchema = z.infer<typeof habit_schema>;
export type AddBoardSchema = z.infer<typeof add_board_schema>;
export type EditBoardSchema = z.infer<typeof edit_board_schema>;
export type DeleteBoardSchema = z.infer<typeof delete_board_schema>;
export type ReorderBoardSchema = z.infer<typeof reorder_board_schema>;
```

- [ ] **Step 2.2: Type check**

Run `npx tsc --noEmit`. Expected errors only in `actions/board.actions.ts` (now missing habit handling) and/or nothing new. Task 3 and 4 will clean these up.

- [ ] **Step 2.3: Review with user**

Report: "Task 2 complete. Zod schema adds MAX_HABITS, habit_schema, and optional habits on add_board_schema. Suggested commit message: `feat(schema): add habit_schema and habits field to add_board_schema`."

---

## Task 3: Types

**File:** `types/index.ts`

- [ ] **Step 3.1: Add `Habit` type and extend `Board`**

Replace the file with:

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

- [ ] **Step 3.2: Type check**

Run `npx tsc --noEmit`. The `Board` type change will surface errors in:
- `actions/board.actions.ts` (return objects missing `habitOrder` / `habits`)
- `hooks/mutations/board.mutation.ts` (cache updates typed against `Board`)

These are expected and resolved in Task 4.

- [ ] **Step 3.3: Review with user**

Report: "Task 3 complete. Habit type added; Board type includes habitOrder and habits?. Suggested commit message: `feat(types): add Habit type and extend Board with habitOrder/habits`."

---

## Task 4: Server actions

**File:** `actions/board.actions.ts`

- [ ] **Step 4.1: Branch `createBoardAction` on board type to create habits when HABIT_TRACKER**

Replace the entire `createBoardAction` export with:

```ts
/**
 * DOCU: Creates a new board for the current user. For TASK_MANAGEMENT boards, creates columns. For HABIT_TRACKER boards, creates habits. <br>
 * Triggered: On submission of new board form. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export const createBoardAction = authActionClient
	.schema(add_board_schema)
	.action(async ({ parsedInput, ctx }) => {
		const board = await prisma.$transaction(async (tx) => {
			/* Create the board with columns or habits depending on type */
			const new_board = await tx.board.create({
				data: {
					name: parsedInput.name,
					type: parsedInput.type,
					userId: ctx.userId,
					columns:
						parsedInput.type === "TASK_MANAGEMENT" && parsedInput.columns
							? { create: parsedInput.columns.map((column) => ({ name: column.name, theme: column.theme })) }
							: undefined,
					habits:
						parsedInput.type === "HABIT_TRACKER" && parsedInput.habits
							? { create: parsedInput.habits.map((habit) => ({ name: habit.name, theme: habit.theme, goal: habit.goal })) }
							: undefined
				},
				include: {
					columns: { select: { id: true }, orderBy: { createdAt: "asc" } },
					habits: { select: { id: true }, orderBy: { createdAt: "asc" } }
				}
			});

			/* Set column / habit order on the board */
			const updated_board = await tx.board.update({
				where: { id: new_board.id },
				data: {
					columnOrder: new_board.columns.map((column) => column.id),
					habitOrder: new_board.habits.map((habit) => habit.id)
				},
				select: {
					id: true,
					name: true,
					type: true,
					columnOrder: true,
					habitOrder: true
				}
			});

			/* Append the new board to the user's board order */
			await tx.user.update({
				where: { id: ctx.userId },
				data: { boardOrder: { push: updated_board.id } }
			});

			return updated_board;
		});

		return board;
	});
```

- [ ] **Step 4.2: Include habits in `getBoardById` return**

Inside the `prisma.board.findUnique` call, extend the `include` to load habits:

```ts
const board = await prisma.board.findUnique({
    where: { id: board_id },
    include: {
        tags: true,
        habits: true,
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
});
```

In the return object, add `habitOrder` (after `columnOrder`) and `habits` (after `tags`):

```ts
return {
    id: board.id,
    name: board.name,
    type: board.type,
    columnOrder: board.columnOrder,
    habitOrder: board.habitOrder,
    tags: board.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
    })),
    habits: sortByIdOrder(board.habits, board.habitOrder).map((habit) => ({
        id: habit.id,
        name: habit.name,
        theme: habit.theme,
        goal: habit.goal
    })),
    columns: sortByIdOrder(board.columns, board.columnOrder).map((column) => ({
        // ...unchanged
    }))
};
```

Bump the JSDoc `Last Updated` to `April 18, 2026`.

- [ ] **Step 4.3: Include habits in `editBoardAction` return**

`editBoardAction` returns a `Board`-shaped object. Add `habitOrder: board.habitOrder` (after `columnOrder`) and `habits: []` (after `tags`) to the return object so the type satisfies the new `Board` type. Do NOT change the `include` block of the `tx.board.update(...)` call — habits are loaded as scalar default; add `habits: true` to include them if needed. Simpler approach: include `habits: true`, then:

```ts
habits: board.habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    theme: habit.theme,
    goal: habit.goal
}))
```

Bump JSDoc `Last Updated` to `April 18, 2026`.

- [ ] **Step 4.4: Type check**

Run `npx tsc --noEmit`. Expected: zero errors across the project after this task (pre-Task-5/6/7 state — modal hasn't been refactored, but the schema changes don't break the modal's existing code yet because `habits` is optional in the Zod schema).

- [ ] **Step 4.5: Review with user**

Report: "Task 4 complete. Server actions branch on type to create habits; getBoardById returns habits; editBoardAction return satisfies new Board type. Suggested commit message: `feat(actions): persist habits on habit-tracker board creation`."

---

## Task 5: Extract `TaskManagementFields` subcomponent

**File:** `components/board/task-management-fields.tsx` (new)

- [ ] **Step 5.1: Create the extracted columns component**

Create the file with:

```tsx
"use client";

/* REACT */
import { useRef, useState } from "react";

/* COMPONENTS */
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SortableColumnField from "@/components/board/sortable-column-field";
import ColorPicker from "@/components/ui/color-picker";

/* PLUGINS */
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

/* SCHEMA */
import { AddBoardSchema, MAX_COLUMNS } from "@/schema/board-schema";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdDragIndicator } from "react-icons/md";

/* CONSTANTS */
import { DEFAULT_COLUMN_THEME } from "@/constants";

interface Props {
	disabled?: boolean;
}

/**
 * DOCU: Form fields for creating a task-management (kanban) board. Owns the columns field array and drag-and-drop reorder UX. <br>
 * Triggered: From CreateBoardmodal when the selected type is TASK_MANAGEMENT. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
const TaskManagementFields = ({ disabled }: Props) => {
	const form = useFormContext<AddBoardSchema>();
	const errors = form.formState.errors;

	const {
		fields: columns,
		append,
		remove,
		replace
	} = useFieldArray({
		control: form.control,
		name: "columns"
	});

	const [drag_sorted_keys, setDragSortedKeys] = useState<string[] | null>(null);
	const snapshot_ref = useRef<AddBoardSchema["columns"]>([]);
	const sorted_keys = drag_sorted_keys ?? columns.map((col) => col.id);

	const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
		snapshot_ref.current = form.getValues("columns");
		setDragSortedKeys(columns.map((col) => col.id));
	};

	const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = (event) => {
		setDragSortedKeys((prev) => {
			if (!prev) return null;
			const items = prev.map((key) => ({ id: key }));
			const reordered = move(items, event);
			return reordered.map((item) => item.id);
		});
	};

	const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = (event) => {
		if (!event.canceled && drag_sorted_keys) {
			const current_values = form.getValues("columns");
			if (!current_values) {
				setDragSortedKeys(null);
				return;
			}
			const new_values = drag_sorted_keys.map((key) => {
				const field_index = columns.findIndex((col) => col.id === key);
				return current_values[field_index];
			});
			replace(new_values);
		}
		setDragSortedKeys(null);
	};

	return (
		<FormItem>
			<FormLabel>Board Columns</FormLabel>
			<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<div className="flex flex-col gap-[12]">
					{sorted_keys.map((key, visual_index) => {
						const field_index = columns.findIndex((col) => col.id === key);
						if (field_index === -1) return null;
						return (
							<SortableColumnField key={key} id={key} index={visual_index} disabled={disabled}>
								<FormField
									control={form.control}
									name={`columns.${field_index}.name`}
									render={({ field }) => (
										<>
											<Controller
												control={form.control}
												name={`columns.${field_index}.theme`}
												render={({ field: theme_field }) => (
													<ColorPicker
														value={theme_field.value || DEFAULT_COLUMN_THEME}
														onChange={theme_field.onChange}
														disabled={disabled}
														className="mx-[8]"
													/>
												)}
											/>
											<Input {...field} defaultValue={field.value} value={undefined} type="text" placeholder="e.g. Done" error={errors.columns?.[field_index]?.name?.message} floating_error />
											<button type="button" className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200 translate-x-2.5" onClick={() => remove(field_index)}>
												<IoIosClose />
											</button>
										</>
									)}
								/>
							</SortableColumnField>
						);
					})}
				</div>
				<DragOverlay dropAnimation={null}>
					{(source) => {
						const field_index = columns.findIndex((col) => col.id === source.id);
						if (field_index === -1) return null;
						const value = form.getValues(`columns.${field_index}.name`);
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

			{columns.length < MAX_COLUMNS && (
				<Button type="button" variant="secondary" className="mt-[12]" onClick={() => append({ name: "", theme: DEFAULT_COLUMN_THEME })} disabled={disabled}>
					<FaPlus /> Add New Column
				</Button>
			)}
		</FormItem>
	);
};

export default TaskManagementFields;
```

- [ ] **Step 5.2: Type check**

Run `npx tsc --noEmit`. Expected: zero errors (file is not yet imported anywhere — it just stands alone).

- [ ] **Step 5.3: Review with user**

Report: "Task 5 complete. TaskManagementFields extracted. Not yet wired into the modal (Task 7 does that). Suggested commit message: `refactor(board): extract TaskManagementFields from create-board modal`."

---

## Task 6: Create `HabitTrackerFields` subcomponent

**File:** `components/board/habit-tracker-fields.tsx` (new)

- [ ] **Step 6.1: Create the habits component**

Create the file with:

```tsx
"use client";

/* REACT */
import { useRef, useState } from "react";

/* COMPONENTS */
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SortableColumnField from "@/components/board/sortable-column-field";
import ColorPicker from "@/components/ui/color-picker";

/* PLUGINS */
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

/* SCHEMA */
import { AddBoardSchema, MAX_HABITS } from "@/schema/board-schema";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdDragIndicator } from "react-icons/md";

/* CONSTANTS */
import { DEFAULT_COLUMN_THEME } from "@/constants";

interface Props {
	disabled?: boolean;
}

/**
 * DOCU: Form fields for creating a habit-tracker board. Owns the habits field array and drag-and-drop reorder UX. Each habit has name, theme, and a monthly goal. <br>
 * Triggered: From CreateBoardmodal when the selected type is HABIT_TRACKER. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
const HabitTrackerFields = ({ disabled }: Props) => {
	const form = useFormContext<AddBoardSchema>();
	const errors = form.formState.errors;

	const {
		fields: habits,
		append,
		remove,
		replace
	} = useFieldArray({
		control: form.control,
		name: "habits"
	});

	const [drag_sorted_keys, setDragSortedKeys] = useState<string[] | null>(null);
	const snapshot_ref = useRef<AddBoardSchema["habits"]>([]);
	const sorted_keys = drag_sorted_keys ?? habits.map((h) => h.id);

	const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
		snapshot_ref.current = form.getValues("habits");
		setDragSortedKeys(habits.map((h) => h.id));
	};

	const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = (event) => {
		setDragSortedKeys((prev) => {
			if (!prev) return null;
			const items = prev.map((key) => ({ id: key }));
			const reordered = move(items, event);
			return reordered.map((item) => item.id);
		});
	};

	const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = (event) => {
		if (!event.canceled && drag_sorted_keys) {
			const current_values = form.getValues("habits");
			if (!current_values) {
				setDragSortedKeys(null);
				return;
			}
			const new_values = drag_sorted_keys.map((key) => {
				const field_index = habits.findIndex((h) => h.id === key);
				return current_values[field_index];
			});
			replace(new_values);
		}
		setDragSortedKeys(null);
	};

	return (
		<FormItem>
			<FormLabel>Habits</FormLabel>
			<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<div className="flex flex-col gap-[12]">
					{sorted_keys.map((key, visual_index) => {
						const field_index = habits.findIndex((h) => h.id === key);
						if (field_index === -1) return null;
						return (
							<SortableColumnField key={key} id={key} index={visual_index} disabled={disabled}>
								<Controller
									control={form.control}
									name={`habits.${field_index}.theme`}
									render={({ field: theme_field }) => (
										<ColorPicker
											value={theme_field.value || DEFAULT_COLUMN_THEME}
											onChange={theme_field.onChange}
											disabled={disabled}
											className="mx-[8]"
										/>
									)}
								/>
								<FormField
									control={form.control}
									name={`habits.${field_index}.name`}
									render={({ field }) => (
										<Input {...field} defaultValue={field.value} value={undefined} type="text" placeholder="e.g. Journal" error={errors.habits?.[field_index]?.name?.message} floating_error />
									)}
								/>
								<FormField
									control={form.control}
									name={`habits.${field_index}.goal`}
									render={({ field }) => (
										<Input {...field} defaultValue={field.value} value={undefined} type="number" min={0} placeholder="Goal" className="w-[80]" error={errors.habits?.[field_index]?.goal?.message} floating_error />
									)}
								/>
								<button type="button" className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200 translate-x-2.5" onClick={() => remove(field_index)}>
									<IoIosClose />
								</button>
							</SortableColumnField>
						);
					})}
				</div>
				<DragOverlay dropAnimation={null}>
					{(source) => {
						const field_index = habits.findIndex((h) => h.id === source.id);
						if (field_index === -1) return null;
						const value = form.getValues(`habits.${field_index}.name`);
						return (
							<div className="flex items-center rounded-md bg-foreground drop-shadow-md">
								<span className="text-primary -translate-x-0.5">
									<MdDragIndicator size={16} />
								</span>
								<Input type="text" value={value || ""} placeholder="e.g. Journal" readOnly />
							</div>
						);
					}}
				</DragOverlay>
			</DragDropProvider>

			{habits.length < MAX_HABITS && (
				<Button type="button" variant="secondary" className="mt-[12]" onClick={() => append({ name: "", theme: DEFAULT_COLUMN_THEME, goal: 20 })} disabled={disabled}>
					<FaPlus /> Add New Habit
				</Button>
			)}
		</FormItem>
	);
};

export default HabitTrackerFields;
```

- [ ] **Step 6.2: Type check**

Run `npx tsc --noEmit`. Expected: zero errors.

- [ ] **Step 6.3: Review with user**

Report: "Task 6 complete. HabitTrackerFields component created with habits field array, drag-and-drop, color picker, and goal input. Not yet wired into the modal. Suggested commit message: `feat(board): add HabitTrackerFields subcomponent for create-board modal`."

---

## Task 7: Refactor `create-board-modal.tsx` to use `BOARD_FIELDS` lookup

**File:** `components/board/create-board-modal.tsx`

- [ ] **Step 7.1: Slim down the modal and wire in the subcomponents**

Replace the entire file with:

```tsx
"use client";

/* REACT */
import { useEffect } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TaskManagementFields from "@/components/board/task-management-fields";
import HabitTrackerFields from "@/components/habit-tracker-fields";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

/* SCHEMA */
import { AddBoardSchema, add_board_schema, BoardType } from "@/schema/board-schema";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* MUTATIONS */
import { useCreateBoard } from "@/hooks/mutations/board.mutation";

/* CONSTANTS */
import { DEFAULT_COLUMN_THEME } from "@/constants";

const BOARD_FIELDS: Record<BoardType, React.ComponentType<{ disabled?: boolean }>> = {
	TASK_MANAGEMENT: TaskManagementFields,
	HABIT_TRACKER: HabitTrackerFields
};

const CreateBoardmodal = () => {
	const setModal = useBoardStore((state) => state.setModal);
	const modals = useBoardStore((state) => state.modals);

	const form = useForm<AddBoardSchema>({
		resolver: zodResolver(add_board_schema),
		defaultValues: {
			name: "",
			type: "TASK_MANAGEMENT",
			columns: [
				{ name: "Todo", theme: DEFAULT_COLUMN_THEME },
				{ name: "Doing", theme: DEFAULT_COLUMN_THEME }
			],
			habits: [
				{ name: "Journal", theme: DEFAULT_COLUMN_THEME, goal: 20 }
			]
		}
	});

	const selected_type = form.watch("type");
	const errors = form.formState.errors;

	const { createBoard, isPending } = useCreateBoard({
		onSuccess: () => {
			setModal("add_board", false);
		}
	});

	const onCreateBoardSubmit: SubmitHandler<AddBoardSchema> = (data) => {
		createBoard(data);
	};

	useEffect(() => {
		if (modals.add_board) {
			form.reset();
		}
	}, [modals.add_board, form]);

	const Fields = BOARD_FIELDS[selected_type];

	return (
		<Dialog
			open={modals.add_board}
			onOpenChange={(value) => setModal("add_board", value)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg">Add New Board</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						className="flex flex-col gap-[24]"
						onSubmit={form.handleSubmit(onCreateBoardSubmit)}
					>
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Board Type</FormLabel>
									<Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="TASK_MANAGEMENT">Task Management</SelectItem>
											<SelectItem value="HABIT_TRACKER">Habit Tracker</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Board Name</FormLabel>
									<Input
										{...field}
										type="text"
										placeholder="e.g. Web Design"
										error={errors.name?.message}
									/>
								</FormItem>
							)}
						/>

						<Fields disabled={isPending} />

						<div className="flex flex-col gap-[12]">
							<Button
								type="submit"
								className="w-full"
								disabled={isPending}
							>
								{isPending ? "Creating board..." : selected_type === "HABIT_TRACKER" ? "Create Habit Tracker" : "Create New Board"}
							</Button>
							<Button type="button" variant="secondary" className="w-full" disabled={isPending} onClick={() => setModal("add_board", false)}>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateBoardmodal;
```

Notes on what's removed:
- All `useFieldArray`, drag state (`drag_sorted_keys`, `snapshot_ref`), drag handlers
- All imports of DragDropProvider, DragOverlay, SortableColumnField, ColorPicker, Controller, useFieldArray, icons
- `useRef`, `useState` imports dropped (nothing left using them)

- [ ] **Step 7.2: Type check**

Run `npx tsc --noEmit`. Expected: **zero errors across the project.**

- [ ] **Step 7.3: Production build**

Run `npm run build`. Expected: build succeeds.

- [ ] **Step 7.4: Manual smoke test (controller runs this, not subagent)**

Deferred to the controller. Subagent reports DONE when 7.1–7.3 pass.

- [ ] **Step 7.5: Review with user**

Report: "Task 7 complete. CreateBoardmodal is now a thin shell that renders BOARD_FIELDS[selected_type]. Type check + build pass. Suggested commit message: `refactor(board): wire BOARD_FIELDS lookup into create-board modal`."

---

## Post-All-Tasks Smoke Test (Controller)

After Task 7, the controller runs `npm run dev` and verifies in the browser:
1. Task-management board creation still works (columns save, board renders as kanban).
2. Habit-tracker board creation works:
   - Board Type = Habit Tracker → "Habits" section appears with one default "Journal" row
   - Add New Habit button adds rows up to 10
   - Each habit has color picker + name + goal number input + delete button
   - Drag-reorder works
   - Submit creates the board; detail page renders the habit-tracker stub
   - Prisma Studio / SQL query confirms habit rows were persisted with correct board association and `habitOrder` populated
3. Existing boards (pre-migration) still render correctly.
