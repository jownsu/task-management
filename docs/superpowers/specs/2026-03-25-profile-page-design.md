# Profile Page Design

## Overview

A dedicated profile page at `/profile` where users can view their statistics, edit their name, and change their password. Accessible via a new "Profile" link in the UserProfile popover.

## Route & Layout

- **Route:** `/app/(pages)/profile/page.tsx` — sits inside the `(pages)` layout group (inherits sidebar, navbar, HydrationBoundary)
- **Layout:** Medium centered container (`max-w-[700px]`, auto margins), stacked sections
- **Responsive:** Forms sit side-by-side on desktop (2-column grid), collapse to single column on mobile

## Page Sections (top to bottom)

### 1. Profile Header

- User avatar (with initials fallback via `getInitials()`)
- User name (bold, large)
- Email (secondary text)
- "Member since [Month Year]" (tertiary text)
- Styled with primary color background, white text

### 2. Statistics Grid

6 stat cards in a 3-column grid (2-column on mobile):

| Stat | Source | Color |
|------|--------|-------|
| Total Boards | `_count` on boards | Primary |
| Total Columns | `_count` on columns via boards | Primary |
| Total Tasks | `_count` on tasks via boards→columns | Primary |
| Total Subtasks | `_count` on subtasks via boards→columns→tasks | Primary |
| Completed Subtasks | `_count` on subtasks where `is_completed = true` | Green/success |
| Completion Rate | `completed / total * 100`, rounded | Green/success |

### 3. Forms Row (side-by-side on desktop)

#### Left: Edit Profile Form

- **Name** — editable text input, pre-filled with current name
- **Email** — read-only input (visually disabled), shows current email
- **Save Changes** button — submits name update

#### Right: Change Password Form

- **For credential users:** 3 password fields (current, new, confirm) + "Update Password" button
- **For OAuth users:** Hide the form entirely, show informational message: "You signed in with Google"

## Data Layer

### Type

```typescript
export type UserProfile = Pick<PrismaUser, "id" | "name" | "email" | "image" | "createdAt"> & {
	has_password: boolean;
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

- `has_password` — derived from `!!user.password`, controls change password section visibility
- `completion_rate` — server-computed as `Math.round((completed / total) * 100)`, 0 if no subtasks

### Server Actions (`actions/user.actions.ts`)

All use `authActionClient` (auto-injects `userId`).

1. **`getUserProfile`** — fetches user fields + aggregated stats via Prisma. Returns `UserProfile` type.
2. **`updateUserName`** — validates with `update_name_schema`, updates user name. Returns updated user.
3. **`changePassword`** — validates with `change_password_schema`, verifies current password with `bcrypt.compare()`, hashes new password with `bcrypt.hash(password, 10)`, updates user. Returns error if user has no password (OAuth user).

### Zod Schemas (`schema/profile-schema.ts`)

```typescript
update_name_schema — { name: string (min 1) }
change_password_schema — { current_password: string (min 1), new_password: string (min 8), confirm_password: string (min 1) }
  .refine() — new_password === confirm_password
```

### React Query

- **Cache key:** `CACHE_KEY_USER = ["user"]` in `constants/query-keys.ts`
- **Query hook:** `useGetUserProfile()` + `prefetchUserProfile()` in `hooks/queries/user.query.ts`
- **Mutation hooks** in `hooks/mutations/`:
  - `useUpdateUserName(callback?)` — invalidates `CACHE_KEY_USER` on success
  - `useChangePassword(callback?)` — success/error callback only, no cache invalidation

### Form Handling

- `react-hook-form` + `zodResolver` for both forms
- Inline on the page (no modals, no Zustand store)

## Navigation Entry

In `components/navigation/user-profile.tsx`:

- Add a "Profile" option (with user/profile icon from `react-icons`) to the PopoverContent
- Uses `next/link` pointing to `/profile`
- Placed above the existing "Logout" button, separated by a visual divider

## Files to Create/Modify

### New Files
- `schema/profile-schema.ts` — Zod schemas
- `actions/user.actions.ts` — Server actions
- `hooks/queries/user.query.ts` — Query hook + prefetch
- `hooks/mutations/update-name.mutation.ts` — Name update mutation
- `hooks/mutations/change-password.mutation.ts` — Password change mutation
- `app/(pages)/profile/page.tsx` — Profile page (server component)
- `components/profile/profile-content.tsx` — Profile page content (client component)

### Modified Files
- `types/index.ts` — Add `UserProfile` type
- `constants/query-keys.ts` — Add `CACHE_KEY_USER`
- `components/navigation/user-profile.tsx` — Add "Profile" link to popover
