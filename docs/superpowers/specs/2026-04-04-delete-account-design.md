# Delete Account Feature — Design Spec

## Overview

Add a delete account feature to the profile page. Users confirm deletion by typing an exact phrase. On success, the session is cleared and the user is redirected to `/login`.

## Requirements

- All users (password and OAuth) confirm by typing the phrase: `Delete my account because I'm gay`
- Deleting the user cascades to all related data (Boards, Columns, Tasks, Subtasks, Sessions, Accounts, Authenticators) via Prisma cascade
- After deletion, sign out via NextAuth and redirect to `/login`
- Generic warning message: "This will permanently delete your account and all associated data. This action cannot be undone."

## Approach

Inline in ProfileContent with local `useState` for modal state. No Zustand store — the modal is only triggered from one place.

## Components

### 1. Zod Schema — `delete_account_schema`

- **File:** `schema/profile-schema.ts`
- **Shape:** `{ confirmation_phrase: string }`
- **Validation:** `.refine()` checks exact match against `"Delete my account because I'm gay"` (case-sensitive)

### 2. Server Action — `deleteAccount`

- **File:** `actions/user.actions.ts`
- Uses `authActionClient.schema(delete_account_schema).action()`
- Extracts `userId` from session context
- Validates the confirmation phrase via the schema
- Calls `prisma.user.delete({ where: { id: userId } })`
- Cascade deletes handle all related records

### 3. Mutation Hook — `useDeleteAccount`

- **File:** `hooks/mutations/user.mutation.ts`
- Calls the `deleteAccount` server action via `executeAction()`
- On success: calls `signOut()` from NextAuth to clear session, then redirects to `/login`
- Supports existing `CallbackResponse` pattern

### 4. UI — Danger Zone Section + Delete Account Modal

- **File:** `components/profile/danger-zone.tsx`
- **Danger Zone Section:**
  - Red-bordered section at the bottom of the profile page
  - Title: "Danger Zone"
  - Generic warning description
  - Destructive "Delete Account" button opens the modal
- **Delete Account Modal (same file):**
  - shadcn `Dialog` controlled by local `useState`
  - Warning text in modal body
  - Instruction: Type the exact phrase to confirm
  - Text input for the phrase
  - Cancel + Delete buttons (Delete is destructive variant, disabled until phrase matches)
  - `isPending` disables input and buttons during deletion

### 5. ProfileContent Integration

- **File:** `components/profile/profile-content.tsx`
- Add `<DangerZone />` below the existing forms grid

## Files Changed

| File | Change |
|------|--------|
| `schema/profile-schema.ts` | Add `delete_account_schema` |
| `actions/user.actions.ts` | Add `deleteAccount` action |
| `hooks/mutations/user.mutation.ts` | Add `useDeleteAccount` hook |
| `components/profile/danger-zone.tsx` | New file — Danger Zone section + modal |
| `components/profile/profile-content.tsx` | Import and render `<DangerZone />` |
