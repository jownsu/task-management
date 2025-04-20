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

/* STORE */
import { useBoardStore } from "@/store/board.store";

const DeleteBoardmodal = () => {
	const setModal = useBoardStore((state) => state.setModal);
	const modals = useBoardStore((state) => state.modals);

	return (
		<Dialog
			open={modals.delete_board}
			onOpenChange={(value) => setModal("delete_board", value)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg text-destructive">
						Delete this board?
					</DialogTitle>
				</DialogHeader>

				<DialogDescription>
					Are you sure you want to delete the &apos;Platform Launch&apos; board?
					This action will remove all columns and tasks and cannot be reversed.
				</DialogDescription>

				<div className="flex flex-col gap-[16] md:flex-row">
					<Button 
						type="button" 
						variant="destructive" 
						className="flex-1"
						onClick={() => setModal("delete_board", false)}
					>
						Delete
					</Button>
					<Button 
						type="button" 
						variant="secondary" 
						className="flex-1"
						onClick={() => setModal("delete_board", false)}
					>
						Cancel
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteBoardmodal;
