"use client";

/* COMPONENTS */
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* STORE */
import { useTaskStore } from "@/store/task.store";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState } from "react";
import ActionOptions from "../actions-dropdown";

const ViewTaskModal = () => {
	const setModal = useTaskStore((state) => state.setModal);
	const modals = useTaskStore((state) => state.modals);

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

	return (
		<Dialog
			open={modals.view_task}
			onOpenChange={(value) => setModal("view_task", value)}
		>
			<DialogContent>
				<div className="flex flex-col gap-[24]">
					<div className="flex">
						<DialogTitle className="text-h-lg">Research pricing points of various competitors and trial different business models</DialogTitle>
						<ActionOptions 
							name="Task" 
							onDeleteClick={() => {}}
							onEditClick={() => {}}
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
									htmlFor={`subtask_${subtask.id}`}
									className={"px-[12] py-[16] bg-background flex gap-[16]"}
								>
									<input 
										type="checkbox" 
										id={`subtask_${subtask.id}`} 
										checked={subtask.is_completed}
										onChange={() => {
											setSubTasks((prev) => 
												prev.map((task) => 
													task.id === subtask.id ? { ...task, is_completed: !task.is_completed } : task
												)
											);
										}}
									/>
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
						<Select value={"1"}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select Status" />
							</SelectTrigger>

							<SelectContent className="">
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
