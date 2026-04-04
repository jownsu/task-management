# Delete Account Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to permanently delete their account by typing a confirmation phrase, then sign out and redirect to login.

**Architecture:** Server action validates the phrase and deletes the user (Prisma cascade handles all related data). A new `DangerZone` component at the bottom of the profile page shows the warning and opens a confirmation modal with phrase input.

**Tech Stack:** Next.js Server Actions, next-safe-action, Prisma, React Query, shadcn Dialog, React Hook Form + Zod, NextAuth signOut

---

### Task 1: Add Zod Schema

**Files:**
- Modify: `schema/profile-schema.ts`

- [ ] **Step 1: Add `delete_account_schema` to profile schema**

At the bottom of `schema/profile-schema.ts`, add:

```typescript
export const delete_account_schema = z.object({
	confirmation_phrase: z.string().refine((value) => value === "Delete my account because I'm gay", {
		message: "Phrase does not match",
	}),
});

export type DeleteAccountSchema = z.infer<typeof delete_account_schema>;
```

---

### Task 2: Add Server Action

**Files:**
- Modify: `actions/user.actions.ts`

- [ ] **Step 1: Add the import for `delete_account_schema`**

In `actions/user.actions.ts`, update the schema import line:

```typescript
import { update_name_schema, change_password_schema, delete_account_schema } from "@/schema/profile-schema";
```

- [ ] **Step 2: Add `deleteAccount` server action**

At the bottom of `actions/user.actions.ts`, add:

```typescript
/**
 * DOCU: Permanently deletes the current user's account and all associated data. <br>
 * Triggered: When the user confirms account deletion on the profile page. <br>
 * Last Updated: April 04, 2026
 * @author Jhones
 */
export const deleteAccount = authActionClient
	.schema(delete_account_schema)
	.action(async ({ ctx }) => {
		await prisma.user.delete({
			where: { id: ctx.userId },
		});

		return { success: true };
	});
```

---

### Task 3: Add Mutation Hook

**Files:**
- Modify: `hooks/mutations/user.mutation.ts`

- [ ] **Step 1: Add the import for `deleteAccount` action and `DeleteAccountSchema` type**

In `hooks/mutations/user.mutation.ts`, update the action import:

```typescript
import { updateUserName, changePassword, deleteAccount } from "@/actions/user.actions";
```

Update the schema type import:

```typescript
import type { UpdateNameSchema, ChangePasswordSchema, DeleteAccountSchema } from "@/schema/profile-schema";
```

- [ ] **Step 2: Add `useDeleteAccount` hook**

At the bottom of `hooks/mutations/user.mutation.ts`, add:

```typescript
/**
 * DOCU: Will delete the current user's account permanently. <br>
 * Triggered: When the user confirms account deletion on the profile page. <br>
 * Last Updated: April 04, 2026
 * @author Jhones
 */
export const useDeleteAccount = (callback?: CallbackResponse) => {
	const { mutate: deleteUserAccount, ...rest } = useMutation({
		mutationFn: (payload: DeleteAccountSchema) => executeAction(deleteAccount(payload)),
		onSuccess: () => {
			callback?.onSuccess?.();
		},
		onError: (error) => {
			callback?.onError?.(error.message);
		},
	});

	return { deleteUserAccount, ...rest };
};
```

---

### Task 4: Create DangerZone Component

**Files:**
- Create: `components/profile/danger-zone.tsx`
- Modify: `components/profile/profile-content.tsx`

- [ ] **Step 1: Create `components/profile/danger-zone.tsx`**

```tsx
"use client";

/* REACT */
import { useState } from "react";

/* COMPONENTS */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/* PLUGINS */
import { signOut } from "next-auth/react";
import { toast } from "sonner";

/* MUTATIONS */
import { useDeleteAccount } from "@/hooks/mutations/user.mutation";

/* ICONS */
import { LuTriangleAlert } from "react-icons/lu";

const CONFIRMATION_PHRASE = "Delete my account because I'm gay";

/**
 * DOCU: This component renders the danger zone section with a delete account button and confirmation modal. <br>
 * Triggered: Rendered at the bottom of the profile page. <br>
 * Last Updated: April 04, 2026
 * @author Jhones
 */
const DangerZone = () => {
	const [is_open, setIsOpen] = useState(false);
	const [phrase, setPhrase] = useState("");

	const is_phrase_match = phrase === CONFIRMATION_PHRASE;

	const { deleteUserAccount, isPending } = useDeleteAccount({
		onSuccess: async () => {
			toast.success("Account deleted successfully.");
			await signOut({ redirectTo: "/login" });
		},
		onError: (error_msg) => {
			toast.error(error_msg || "Failed to delete account.");
		},
	});

	/**
	 * DOCU: Handles the delete account action after phrase confirmation. <br>
	 * Triggered: When the user clicks the delete button in the modal. <br>
	 * Last Updated: April 04, 2026
	 * @author Jhones
	 */
	const handleDeleteAccount = () => {
		if (!is_phrase_match) return;
		deleteUserAccount({ confirmation_phrase: phrase });
	};

	/**
	 * DOCU: Resets the phrase input when the modal is closed. <br>
	 * Triggered: When the modal open state changes. <br>
	 * Last Updated: April 04, 2026
	 * @author Jhones
	 */
	const handleOpenChange = (value: boolean) => {
		if (isPending) return;
		setIsOpen(value);
		if (!value) setPhrase("");
	};

	return (
		<>
			{/* Danger Zone Section */}
			<div className="mt-[24] rounded-lg border border-destructive/50 bg-foreground p-[20]">
				<div className="mb-[16] flex items-center gap-[8]">
					<LuTriangleAlert size={16} className="text-destructive" />
					<span className="!text-b-sm font-semibold uppercase tracking-wider text-destructive">Danger Zone</span>
				</div>

				<p className="!text-b-md mb-[16] text-medium-grey">This will permanently delete your account and all associated data. This action cannot be undone.</p>

				<Button variant="destructive" onClick={() => setIsOpen(true)}>
					Delete Account
				</Button>
			</div>

			{/* Delete Account Modal */}
			<Dialog open={is_open} onOpenChange={handleOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-h-lg text-destructive">Delete Account</DialogTitle>
					</DialogHeader>

					<DialogDescription>This will permanently delete your account and all associated data. This action cannot be undone.</DialogDescription>

					<div className="flex flex-col gap-[16]">
						<div>
							<p className="!text-b-sm mb-[8] text-medium-grey">
								Type <span className="font-bold text-foreground-inverted">{CONFIRMATION_PHRASE}</span> to confirm.
							</p>
							<Input value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="Type the phrase to confirm" disabled={isPending} />
						</div>

						<div className="flex flex-col gap-[16] md:flex-row">
							<Button type="button" variant="secondary" className="flex-1" onClick={() => handleOpenChange(false)} disabled={isPending}>
								Cancel
							</Button>
							<Button type="button" variant="destructive" className="flex-1" onClick={handleDeleteAccount} disabled={!is_phrase_match || isPending}>
								{isPending ? "Deleting..." : "Delete Account"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default DangerZone;
```

- [ ] **Step 2: Add `DangerZone` to `ProfileContent`**

In `components/profile/profile-content.tsx`, add the import at the top (under the existing component imports):

```typescript
import DangerZone from "@/components/profile/danger-zone";
```

Then add `<DangerZone />` after the closing `</div>` of the forms grid (after line 240), before the final closing `</div>`:

```tsx
			{/* Forms Row */}
			<div className="grid grid-cols-1 gap-[24] md:grid-cols-2">
				{/* ... existing forms ... */}
			</div>

			{/* Danger Zone */}
			<DangerZone />
		</div>
```

---

### Task 5: Verify

- [ ] **Step 1: Run the dev server and verify**

Run: `npm run dev`

Test manually:
1. Navigate to `/profile`
2. Verify the Danger Zone section appears below the forms
3. Click "Delete Account" — modal opens
4. Type a wrong phrase — Delete button stays disabled
5. Type exactly `Delete my account because I'm gay` — Delete button enables
6. Click Delete — account is deleted, redirected to `/login`

- [ ] **Step 2: Run build to check for type errors**

Run: `npm run build`

Expected: Build completes with no type errors.
