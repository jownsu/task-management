"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* COMPONENTS */
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";

/* HOOKS */
import { useDeleteColumn } from "@/hooks/mutations/delete-column.mutation";

/* CONSTANTS */
import { Column } from "@/types";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selected_column: Column | null;
	onDeleteColumn?: () => void;
}

const DeleteColumnModal = ({ open, onOpenChange, selected_column, onDeleteColumn }: Props) => {
	const { board_id } = useParams() as { board_id: string };
	const { deleteColumn, isPending } = useDeleteColumn(board_id, {
		onSuccess: () => {
			onDeleteColumn?.();
		}
	});

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => !isPending && onOpenChange(open)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg text-destructive">
						Delete this column?
					</DialogTitle>
				</DialogHeader>

				<DialogDescription>
					Are you sure you want to delete the &apos;{selected_column?.title}&apos;
					column? This action will remove all tasks and cannot be
					reversed.
				</DialogDescription>

				<div className="flex flex-col gap-[16] md:flex-row">
					<DialogClose asChild>
						<Button
							type="button"
							variant="secondary"
							className="flex-1"
							disabled={isPending}
						>
							Cancel
						</Button>
					</DialogClose>

					<Button
						type="button"
						variant="destructive"
						className="flex-1"
						onClick={() =>
							selected_column?.id && deleteColumn({ id: selected_column?.id })
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
