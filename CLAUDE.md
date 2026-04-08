# CLAUDE.md — Kanban Task Management

## Project Overview

A Kanban-style task management app (boards → columns → tasks → subtasks) built with **Next.js 16** (App Router), **React 19**, **TypeScript 5**, **Prisma 7** (PostgreSQL), and **Tailwind CSS v4**.

## Quick Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run mock         # Start json-server mock API on port 3001
npx prisma generate  # Regenerate Prisma client
npx prisma db seed   # Seed database
```

## Tech Stack

| Layer            | Technology                                      |
|------------------|------------------------------------------------|
| Framework        | Next.js 16 (App Router, RSC, Server Actions)   |
| UI               | React 19, shadcn/ui (new-york style), Radix UI |
| Styling          | Tailwind CSS v4, next-themes (dark mode)        |
| Server State     | TanStack React Query v5                         |
| Client State     | Zustand v5                                      |
| Forms            | react-hook-form + @hookform/resolvers + Zod     |
| ORM              | Prisma 7 with @prisma/adapter-pg                |
| Database         | PostgreSQL (UUIDs for all IDs)                  |
| Font             | Plus Jakarta Sans (next/font/google)            |
| Icons            | lucide-react, react-icons                       |
| Mock API         | json-server (port 3001) with custom routes      |

## Project Structure

```
actions/              # Server Actions ("use server") — Prisma queries
app/
  (auth)/login/       # Login page (auth not yet implemented)
  (pages)/            # Main layout (sidebar + HydrationBoundary)
    [board_id]/       # Board detail page (columns, tasks, modals)
    page.tsx          # Home page
  layout.tsx          # Root layout (font, providers)
  globals.css         # Tailwind v4 config, CSS variables, custom utilities
components/
  board/              # Board CRUD modals
  columns/            # Column list, column item, task items
  task/               # Task CRUD modals (create, edit, view, delete)
  navigation/         # Sidebar, navbar, mobile nav, theme switch
  providers/          # QueryClientProvider + ThemeProvider
  ui/                 # shadcn/ui primitives (customized)
constants/
  query-keys.ts       # React Query cache keys (CACHE_KEY_BOARDS, CACHE_KEY_BOARD)
  index.tsx           # BREAKPOINTS, STALE_TIME
  env.ts              # ENV variable accessor
hooks/
  queries/            # useQuery + prefetch hooks (per feature)
  mutations/          # useMutation hooks (per feature)
lib/
  generated/prisma/   # Prisma client output (custom path)
  prisma.ts           # PrismaClient singleton (with pg adapter)
  get-query-client.ts # QueryClient singleton (SSR-safe)
  utils.ts            # cn() helper (clsx + tailwind-merge)
mock/                 # json-server mock API (data, routes, server)
prisma/
  schema.prisma       # 5 models: User, Board, Column, Task, Subtask
  seed.ts             # Database seeder
schema/               # Zod validation schemas (board, column, task)
services/             # Axios-based API service classes
store/                # Zustand stores (board, task, column, navigation)
types/index.ts        # App types derived from Prisma types (Pick + extend)
```

## Database Models (Prisma)

```
User → Board[] (one-to-many, cascade)
Board → Column[] (one-to-many, cascade)
Column → Task[] (one-to-many, cascade)
Task → Subtask[] (one-to-many, cascade)
```

All IDs are UUIDs (`gen_random_uuid()`). All models have `createdAt`/`updatedAt`.

## Architecture Patterns

### Dual API Layer (Migration In Progress)

The app is migrating from a mock REST API to Prisma Server Actions:

- **Primary (current):** Server Actions in `actions/` call Prisma directly, used as `queryFn` in React Query hooks
- **Legacy:** Axios services in `services/` hit the json-server mock API on port 3001. Some mutations still use this layer.

### Data Flow (SSR + Client)

1. **Server:** Page component calls `prefetchBoard()` → `queryClient.prefetchQuery()` → `dehydrate()`
2. **Server → Client:** `<HydrationBoundary state={dehydratedState}>` passes cache to client
3. **Client:** `useGetBoard()` reads from hydrated cache, auto-refetches when stale

### Modal Pattern

All modals are controlled via Zustand stores, rendered at the page level:
- Zustand store has `modals` object with boolean flags + `setModal(key, boolean)` method
- Components call `setModal("edit_board", true)` to open
- Modal components read their flag and render via shadcn `Dialog`

### Zustand Stores

- `board.store.ts` — Board modal states + selected_board
- `task.store.ts` — Task modal states + selected_task
- `column.store.ts` — selected_column + optional callback
- `navigation.store.ts` — is_sidebar_open

### React Query Cache Keys

Defined in `constants/query-keys.ts`:
- `CACHE_KEY_BOARDS = ["boards"]` — all boards list
- `CACHE_KEY_BOARD = ["board"]` — single board (spread with `[...CACHE_KEY_BOARD, board_id]`)

## Coding Conventions

### Naming

| Element              | Convention    | Example                          |
|---------------------|--------------|----------------------------------|
| Variables           | `snake_case`  | `selected_board`, `board_id`     |
| Functions           | `camelCase`   | `getUserProfile`, `prefetchBoard`|
| Classes/Types       | `PascalCase`  | `BoardStore`, `AddBoardSchema`   |
| File names          | `kebab-case`  | `create-board-modal.tsx`         |
| Cache keys          | `UPPER_SNAKE` | `CACHE_KEY_BOARDS`               |

### Import Organization

Always use absolute imports with `@/` alias. Group imports with labeled comments in this order:

```typescript
/* NEXT */
/* REACT */
/* COMPONENTS */
/* PLUGINS */
/* STORE */
/* QUERIES */
/* MUTATIONS */
/* SCHEMA */
/* SERVICES */
/* ACTIONS */
/* TYPES */
/* CONSTANTS */
/* ICONS */
/* UTILITIES */
/* STYLES */
```

### Function Documentation (JSDoc)

Every function must use this format:

```typescript
/**
 * DOCU: What the function does. <br>
 * Triggered: When/where it is called. <br>
 * Last Updated: Month DD, YYYY
 * @author Jhones
 */
```

### Tailwind CSS

- Use Tailwind v4 syntax (no `tailwind.config.js`, config is in `globals.css` via `@theme inline`)
- **Arbitrary values use integers only, no units:** `p-[20]` not `p-[20px]`. Custom `@utility` rules convert to rem.
- Prefer custom utility classes from `globals.css` when available
- Dark mode is class-based (`.dark` class on `<html>`)

### Formatting (Prettier)

- Indentation: Tabs
- Print width: 800
- Semicolons: Always
- Quotes: Double quotes
- Plugin: `prettier-plugin-tailwindcss`
- Only format changed code, not entire files

### Types

App types in `types/index.ts` are derived from Prisma types using `Pick` + extension:
```typescript
export type Board = Pick<PrismaBoard, "id" | "name"> & { columns?: Column[] };
```

### Zod Schemas

Located in `schema/`. Named `snake_case` (e.g., `add_board_schema`). Exported inferred types in `PascalCase` (e.g., `AddBoardSchema`).

### Hooks Pattern

- **Queries:** `hooks/queries/[feature].query.ts` — exports `useGet[Feature]()` + `prefetch[Feature]()`
- **Mutations:** `hooks/mutations/[action]-[feature].mutation.ts` — exports `use[Action][Feature](callback?)`
- Mutations accept optional `CallbackResponse` with `onSuccess`/`onError` callbacks

### Service Layer (Legacy)

Classes in `services/` extend `APIClient`. Use `.then()/.catch()` chaining with `res.status` check.

### API Response Shape (Mock)

```json
{ "status": boolean, "result": T | null, "error": unknown, "message": string | null }
```

## Rules

- **NEVER commit without explicit permission.** Do not run `git commit` unless the user explicitly asks. This includes subagents — always instruct them not to commit. The user wants to review all changed files before committing.

## Current State / Notes

- **Auth:** Scaffolded (User model, login page, middleware stub) but not implemented. No session checks on server actions yet.
- **Branch:** `develop-with-prisma` — active migration from mock API to Prisma
- **No tests:** No test framework or test files exist
- **next-safe-action:** Installed but not yet used in any server actions
