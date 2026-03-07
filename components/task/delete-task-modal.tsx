"use client";

/* NEXT */
import { useParams } from "next/navigation";

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
import { useSelectedTask } from "@/hooks/use-selected-task";

/* MUTATIONS */
import { useDeleteTask } from "@/hooks/mutations/task.mutation";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/**
 * DOCU: Modal for confirming deletion of a task and its subtasks. <br>
 * Triggered: When the user clicks delete on a task. <br>
 * Last Updated: March 07, 2026
 * @author Jhones
 */
const DeleteTaskModal = () => {
	const { board_id } = useParams() as { board_id: string };
	const setModal = useTaskStore((state) => state.setModal);
	const modals = useTaskStore((state) => state.modals);
	const selected_task = useSelectedTask();

	const { deleteTask, isPending } = useDeleteTask({
		onSuccess: () => {
			setModal("delete_task", false);
			setModal("view_task", false);
		}
	});

	/**
	 * DOCU: Handles the delete task action. <br>
	 * Triggered: When the user clicks the delete button. <br>
	 * Last Updated: March 07, 2026
	 * @author Jhones
	 */
	const handleDeleteTask = () => {
		if (!selected_task) return;

		deleteTask({
			id: selected_task.id,
			board_id,
			column_id: selected_task.column_id
		});
	};

	return (
		<Dialog
			open={modals.delete_task}
			onOpenChange={(value) => setModal("delete_task", value)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg text-destructive">
						Delete this task?
					</DialogTitle>
				</DialogHeader>

				<DialogDescription>
					Are you sure you want to delete the &apos;{selected_task?.title}&apos;
					task and its subtasks? This action cannot be reversed.
				</DialogDescription>

				<div className="flex flex-col gap-[16] md:flex-row">
					<Button
						type="button"
						variant="secondary"
						className="flex-1"
						disabled={isPending}
						onClick={() => setModal("delete_task", false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						className="flex-1"
						disabled={isPending}
						onClick={handleDeleteTask}
					>
						{isPending ? "Deleting..." : "Delete"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteTaskModal;
