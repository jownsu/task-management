"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useEffect, useState } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ActionOptions from "@/components/actions-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogDescription } from "@/components/ui/dialog";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* HOOKS */
import { useSelectedTask } from "@/hooks/use-selected-task";

/* TYPES */
import { Subtask } from "@/types";

/* MUTATIONS */
import { useUpdateSubtask } from "@/hooks/mutations/subtask.mutation";

/* UTILITIES */
import { cn } from "@/lib/utils";

const ViewTaskModal = () => {
	const { board_id } = useParams() as { board_id: string };

	const setModal = useTaskStore((state) => state.setModal);
	const modals = useTaskStore((state) => state.modals);
	const selected_task = useSelectedTask();

	const [sub_tasks, setSubTasks] = useState<Subtask[]>([]);

	const { updateSubtask } = useUpdateSubtask()

	useEffect(() => {
		if(selected_task){
			setSubTasks(selected_task.subtasks);
		}
	}, [selected_task]);

	/**
	 * DOCU: Updates the subtasks and current status when the selected task changes. <br>
	 * Triggered: When the selected task changes. <br>
	 */
	const onToggleSubtask = (subtask: Subtask) => {
		setSubTasks((prev_tasks) =>
			prev_tasks.map((prev_task) =>
				prev_task.id === subtask.id ? { ...prev_task, isCompleted: !prev_task.isCompleted } : prev_task
			)
		);

		if(selected_task){
			updateSubtask({
				board_id,
				column_id: selected_task.column_id,
				task_id: selected_task.id,
				subtask_id: subtask.id,
				isCompleted: !subtask.isCompleted
			})
		}
	}

	return (
		<Dialog
			open={modals.view_task && !modals.edit_task && !modals.delete_task}
			onOpenChange={(value) => setModal("view_task", value)}
		>
			<DialogContent>
				<div className="flex flex-col gap-[24]">
					<div className="flex">
						<DialogTitle className="text-h-lg flex-1">{selected_task?.title}</DialogTitle>
						<ActionOptions
							name="Task"
							onDeleteClick={() => {
								setModal("delete_task", true);
							}}
							onEditClick={() => {
								setModal("edit_task", true);
							}}
						/>
					</div>

					<DialogDescription className="!text-b-lg text-medium-grey">
						{selected_task?.description}
					</DialogDescription>

					<div className="grid gap-4">
						<label className="text-medium-grey t-[12] font-bold leading-none">Subtasks ({sub_tasks.filter(subtask => subtask.isCompleted).length}/{sub_tasks.length})</label>
						<div className="flex flex-col gap-2">
							{sub_tasks.map((subtask) => (
								<label
									key={subtask.id}
									className={"px-[12] py-[16] bg-background flex gap-[16] cursor-pointer"}
									tabIndex={0}
									aria-label={subtask.title}
									onClick={(event) => {
										event.preventDefault();
										event.stopPropagation();
										onToggleSubtask(subtask);
									}}
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											onToggleSubtask(subtask);
										}
									}}
								>
									<Checkbox checked={subtask.isCompleted} />
									<span
										className={cn("t-[12] font-bold dark:text-white", {
											["line-through opacity-50"]: subtask.isCompleted,
										})}
									>
										{subtask.title}
									</span>
								</label>
							))}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ViewTaskModal;
