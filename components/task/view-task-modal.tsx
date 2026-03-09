"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* COMPONENTS */
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ActionOptions from "@/components/actions-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogDescription } from "@/components/ui/dialog";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* HOOKS */
import { useSelectedTask } from "@/hooks/use-selected-task";

/* MUTATIONS */
import { useUpdateSubtask, useUpdateTaskColumn } from "@/hooks/mutations/task.mutation";

/* UTILITIES */
import { cn } from "@/lib/utils";

const ViewTaskModal = () => {
	const { board_id } = useParams() as { board_id: string };

	const setModal = useTaskStore((state) => state.setModal);
	const modals = useTaskStore((state) => state.modals);
	const selected_task = useSelectedTask();
	const sub_tasks = selected_task?.subtasks ?? [];
	const { board } = useGetBoard(board_id);

	const { updateSubtask } = useUpdateSubtask();
	const { updateTaskColumn } = useUpdateTaskColumn();

	/**
	 * DOCU: Moves the task to a different column. <br>
	 * Triggered: When the column dropdown value is changed. <br>
	 * Last Updated: March 09, 2026
	 * @author Jhones
	 */
	const onColumnChange = (new_column_id: string) => {
		if (selected_task && new_column_id !== selected_task.column_id) {
			updateTaskColumn({
				board_id,
				task_id: selected_task.id,
				old_column_id: selected_task.column_id,
				new_column_id
			});
		}
	};

	/**
	 * DOCU: Toggles the completion status of a subtask. <br>
	 * Triggered: When a subtask checkbox is clicked. <br>
	 */
	const onToggleSubtask = (subtask_id: string, isCompleted: boolean) => {
		if(selected_task){
			updateSubtask({
				board_id,
				column_id: selected_task.column_id,
				task_id: selected_task.id,
				subtask_id,
				isCompleted: !isCompleted
			});
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
										onToggleSubtask(subtask.id, subtask.isCompleted);
									}}
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											onToggleSubtask(subtask.id, subtask.isCompleted);
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

					<div className="grid gap-2">
						<label className="text-medium-grey t-[12] font-bold leading-none">Column</label>
						<Select value={selected_task?.column_id} onValueChange={onColumnChange}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select Column" />
							</SelectTrigger>
							<SelectContent>
								{board?.columns?.map((column) => (
									<SelectItem key={column.id} value={column.id}>
										{column.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ViewTaskModal;
