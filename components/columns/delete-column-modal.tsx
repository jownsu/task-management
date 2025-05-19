"use client";

/* COMPONENTS */
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";

/* HOOKS */
import { useDeleteBoard } from "@/mutations/delete-board.mutation";

/* STORE */
import { useColumnStore } from "@/store/column.store";

const DeleteColumnModal = () => {
	const setModal = useColumnStore((state) => state.setModal);
	const modals = useColumnStore((state) => state.modals);
	const selected_column = useColumnStore((state) => state.selected_column);

	/* TODO: Replace with delete column function */
	const { deleteBoard, isPending } = useDeleteBoard();

	return (
		<Dialog
			open={modals.delete_column}
			onOpenChange={(value) => !isPending && setModal("delete_column", value)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg text-destructive">
						Delete this colummn?
					</DialogTitle>
				</DialogHeader>

				<DialogDescription>
					Are you sure you want to delete the &apos;{selected_column?.title}&apos;
					column? This action will remove all tasks and cannot be
					reversed.
				</DialogDescription>

				<div className="flex flex-col gap-[16] md:flex-row">
					<Button
						type="button"
						variant="secondary"
						className="flex-1"
						onClick={() => setModal("delete_column", false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						className="flex-1"
						onClick={() =>
							selected_column?.id && deleteBoard({ id: selected_column?.id })
						}
						disabled={isPending}
					>
						{isPending ? "Deleting..." : "Delete"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteColumnModal;
