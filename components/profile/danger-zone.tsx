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
