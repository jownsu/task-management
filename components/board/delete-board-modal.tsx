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
import { useDeleteBoard } from "@/hooks/mutations/board.mutation";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* SCHEMA */
import { BoardType } from "@/schema/board-schema";

const BOARD_DELETE_DESCRIPTIONS: Record<BoardType, string> = {
	TASK_MANAGEMENT: "This action will remove all columns and tasks and cannot be reversed.",
	HABIT_TRACKER: "This action will remove all habits and their progress and cannot be reversed."
};

const DeleteBoardModal = () => {
	const setModal = useBoardStore((state) => state.setModal);
	const modals = useBoardStore((state) => state.modals);
	const selected_board = useBoardStore((state) => state.selected_board);

	const { deleteBoard, isPending } = useDeleteBoard({
		onSuccess: () => {
			setModal("delete_board", false);
		}
	});

	/**
	 * DOCU: Handles the delete board action. <br>
	 * Triggered: When the user clicks the delete button. <br>
	 * Last Updated: March 07, 2026
	 * @author Jhones
	 */
	const handleDeleteBoard = () => {
		if (!selected_board) return;

		deleteBoard({ id: selected_board.id });
	};

	return (
		<Dialog
			open={modals.delete_board}
			onOpenChange={(value) => !isPending && setModal("delete_board", value)}

		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg text-destructive">
						Delete this board?
					</DialogTitle>
				</DialogHeader>

				<DialogDescription>
					Are you sure you want to delete the &apos;{selected_board?.name}&apos;
					board? {selected_board && BOARD_DELETE_DESCRIPTIONS[selected_board.type]}
				</DialogDescription>

				<div className="flex flex-col gap-[16] md:flex-row">
					<Button
						type="button"
						variant="secondary"
						className="flex-1"
						onClick={() => setModal("delete_board", false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						className="flex-1"
						onClick={handleDeleteBoard}
						disabled={isPending}
					>
						{isPending ? "Deleting..." : "Delete"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteBoardModal;
