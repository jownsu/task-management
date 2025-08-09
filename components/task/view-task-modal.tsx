"use client";

/* NEXT */
import { useState } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import ActionOptions from "@/components/actions-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogDescription } from "@/components/ui/dialog";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* UTILITIES */
import { cn } from "@/lib/utils";


const ViewTaskModal = () => {
	const setModal = useTaskStore((state) => state.setModal);
	const modals = useTaskStore((state) => state.modals);
	const setSelectedTask = useTaskStore((state) => state.setSelectedTask);

	const [sub_tasks, setSubTasks] = useState([
		{
			id: "1",
			title: "Subtask 1",
			is_completed: true
		},
		{
			id: "2",
			title: "Subtask 2",
			is_completed: true
		},
		{
			id: "3",
			title: "Subtask 3",
			is_completed: false
		}
	])
	const [current_status, setCurrentStatus] = useState("1")

	return (
		<Dialog
			open={modals.view_task && !modals.edit_task}
			onOpenChange={(value) => setModal("view_task", value)}
		>
			<DialogContent>
				<div className="flex flex-col gap-[24]">
					<div className="flex">
						<DialogTitle className="text-h-lg">Research pricing points of various competitors and trial different business models</DialogTitle>
						<ActionOptions 
							name="Task" 
							onDeleteClick={() => {}}
							onEditClick={() => {
								setModal("edit_task", true);
								setSelectedTask({
									id: "1",
									title: "Research pricing points of various competitors and trial different business models",
									description: "We know what we're planning to build for version one. Now we need to finalise the first pricing model we'll use. Keep iterating the subtasks until we have a coherent proposition.",
									sub_tasks: sub_tasks,
									column_id: "1"
								});
							}}
						/>
					</div>

					<DialogDescription className="!text-b-lg text-medium-grey">
						We know what we&apos;re planning to build for version one. Now we need to finalise the first pricing model we&apos;ll use. Keep iterating the subtasks until we have a coherent proposition.
					</DialogDescription>
					
					<div className="grid gap-4">
						<label className="text-medium-grey t-[12] font-bold leading-none">Subtasks ({sub_tasks.filter(subtask => subtask.is_completed).length}/{sub_tasks.length})</label>
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
										setSubTasks((prev_tasks) => 
											prev_tasks.map((prev_task) => 
												prev_task.id === subtask.id ? { ...prev_task, is_completed: !prev_task.is_completed } : prev_task
											)
										);
									}}
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											setSubTasks((prev_tasks) => 
												prev_tasks.map((prev_task) => 
													prev_task.id === subtask.id ? { ...prev_task, is_completed: !prev_task.is_completed } : prev_task
												)
											);
										}
									}}
								>
									<Checkbox checked={subtask.is_completed} />
									<span 
										className={cn("t-[12] font-bold dark:text-white", {
											["line-through opacity-50"]: subtask.is_completed,
										})}
									>
										{subtask.title}
									</span>
								</label>
							))}
						</div>
					</div>

					<div className="grid gap-2">
						<label className="text-medium-grey t-[12] font-bold leading-none">Current Status</label>
						<Select value={current_status} onValueChange={(value) => setCurrentStatus(value)}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select Status" />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="1">Todo</SelectItem>
								<SelectItem value="2">Doing</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ViewTaskModal;
