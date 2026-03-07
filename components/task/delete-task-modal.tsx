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
import { useSelectedTask } from "@/hooks/use-selected-task";

/* STORE */
import { useTaskStore } from "@/store/task.store";

const DeleteTaskModal = () => {
	const setModal = useTaskStore((state) => state.setModal);
	const modals = useTaskStore((state) => state.modals);
	const selected_task = useSelectedTask();

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
						onClick={() => setModal("delete_task", false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						className="flex-1"
						onClick={() => console.log({ id: selected_task?.id })}
					>
						Delete
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteTaskModal;
