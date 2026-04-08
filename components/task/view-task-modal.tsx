"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useEffect, useRef, useState } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ActionOptions from "@/components/actions-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import SortableSubtaskField from "@/components/task/sortable-subtask-field";
import QuickAddSubtask from "@/components/task/quick-add-subtask";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

/* PLUGINS */
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* HOOKS */
import { useSelectedTask } from "@/hooks/use-selected-task";

/* MUTATIONS */
import { useUpdateSubtask, useUpdateTaskColumn, useReorderSubtask, useMarkAllSubtasksComplete, useToggleTaskComplete } from "@/hooks/mutations/task.mutation";

/* TYPES */
import { Subtask } from "@/types";

/* UTILITIES */
import { cn } from "@/lib/utils";

/* CONSTANTS */
import { MAX_SUBTASKS } from "@/schema/task-schema";

/* ICONS */
import { MdDragIndicator, MdCheckCircle } from "react-icons/md";

const ViewTaskModal = () => {
	const { board_id } = useParams() as { board_id: string };

	const setModal = useTaskStore((state) => state.setModal);
	const modals = useTaskStore((state) => state.modals);
	const selected_task = useSelectedTask();
	const { board } = useGetBoard(board_id);

	const { updateSubtask, isPending: is_updating_subtask } = useUpdateSubtask();
	const { updateTaskColumn } = useUpdateTaskColumn();
	const { reorderSubtask, isPending: is_reordering } = useReorderSubtask();
	const { isPending: is_marking_all } = useMarkAllSubtasksComplete();
	const { toggleTaskComplete, isPending: is_toggling_complete } = useToggleTaskComplete();
	const [subtasks, setSubtasks] = useState<Subtask[]>(selected_task?.subtasks ?? []);
	const subtasks_snapshot_ref = useRef<Subtask[]>([]);

	useEffect(() => {
		setSubtasks(selected_task?.subtasks ?? []);
	}, [selected_task?.subtasks]);

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

	/**
	 * DOCU: Toggles the completion status of the task. <br>
	 * Triggered: On clicking the mark as done/incomplete button in the view task modal. <br>
	 * Last Updated: April 09, 2026
	 * @author Jhones
	 */
	const onToggleTaskComplete = () => {
		if (selected_task) {
			toggleTaskComplete({
				board_id,
				column_id: selected_task.column_id,
				task_id: selected_task.id,
				isCompleted: !selected_task.isCompleted
			});
		}
	};

	/**
	 * DOCU: Captures the current subtasks state before dragging starts for rollback on cancel. <br>
	 * Triggered: When a subtask item starts being dragged. <br>
	 * Last Updated: April 05, 2026
	 * @author Jhones
	 */
	const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
		subtasks_snapshot_ref.current = subtasks;
	};

	/**
	 * DOCU: Handles the drag over event to optimistically reorder subtasks. <br>
	 * Triggered: When a dragged subtask is hovering over another subtask. <br>
	 * Last Updated: April 05, 2026
	 * @author Jhones
	 */
	const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = (event) => {
		setSubtasks((prev) => move(prev, event));
	};

	/**
	 * DOCU: Persists the subtask reorder to the server on drag end, or reverts on cancel. <br>
	 * Triggered: When a dragged subtask is dropped after dragging. <br>
	 * Last Updated: April 05, 2026
	 * @author Jhones
	 */
	const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = (event) => {
		if (event.canceled) {
			setSubtasks(subtasks_snapshot_ref.current);
			return;
		}

		const updated_subtask_order = subtasks.map((s) => s.id);
		const snapshot_order = subtasks_snapshot_ref.current.map((s) => s.id);

		if (JSON.stringify(snapshot_order) === JSON.stringify(updated_subtask_order)) {
			return;
		}

		if (selected_task) {
			reorderSubtask({
				board_id,
				column_id: selected_task.column_id,
				task_id: selected_task.id,
				updated_subtask_order
			});
		}
	};

	return (
		<Dialog
			open={modals.view_task && !modals.edit_task && !modals.delete_task}
			onOpenChange={(value) => setModal("view_task", value)}
		>
			<DialogContent>
				<div className="flex flex-col gap-[24]">
					<div className="flex">
						<div className="flex-1 flex items-start gap-[12]">
							{selected_task?.isCompleted && (
								<span className="text-success mt-[4]">
									<MdCheckCircle size={20} />
								</span>
							)}
							<DialogTitle className={cn("text-h-lg flex-1", selected_task?.isCompleted && "line-through opacity-50")}>{selected_task?.title}</DialogTitle>
						</div>
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

					{selected_task?.description ? (
						<DialogDescription className="!text-b-lg text-medium-grey">
							{selected_task.description}
						</DialogDescription>
					) : (
						<VisuallyHidden>
							<DialogDescription>No description</DialogDescription>
						</VisuallyHidden>
					)}

					<div>
						{subtasks.length > 0 && (
							<>
								<label className="text-medium-grey t-[12] font-bold leading-none mb-[16]">Subtasks ({subtasks.filter(subtask => subtask.isCompleted).length}/{subtasks.length})</label>
								<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
									<div className="flex flex-col gap-2">
										{subtasks.map((subtask, index) => (
											<SortableSubtaskField key={subtask.id} id={subtask.id} index={index} disabled={is_updating_subtask || is_reordering || is_marking_all}>
												<label
													className={cn("px-[12] py-[16] bg-background flex gap-[16] cursor-pointer flex-1 min-w-0", { "pointer-events-none opacity-50": is_updating_subtask || is_reordering || is_marking_all })}
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
											</SortableSubtaskField>
										))}
									</div>
									<DragOverlay dropAnimation={null}>
										{(source) => {
											const subtask = subtasks.find((s) => s.id === source.id);
											if (!subtask) return null;

											return (
												<div className="flex items-center rounded-md bg-foreground drop-shadow-md">
													<span className="text-primary -translate-x-0.5">
														<MdDragIndicator size={16} />
													</span>
													<div className="px-[12] py-[16] bg-background flex gap-[16] flex-1 min-w-0">
														<Checkbox checked={subtask.isCompleted} />
														<span
															className={cn("t-[12] font-bold dark:text-white", {
																["line-through opacity-50"]: subtask.isCompleted,
															})}
														>
															{subtask.title}
														</span>
													</div>
												</div>
											);
										}}
									</DragOverlay>
								</DragDropProvider>
								{selected_task && (
									<button
										type="button"
										className={cn(
											"flex items-center h-[32] gap-[8] w-fit t-[13] font-bold mt-[8] cursor-pointer disabled:opacity-50",
											selected_task.isCompleted ? "text-medium-grey" : "text-success"
										)}
										disabled={is_toggling_complete || is_updating_subtask || is_reordering}
										onClick={onToggleTaskComplete}
									>
										<MdCheckCircle size={16} />
										{selected_task.isCompleted ? "Mark as incomplete" : "Mark as done"}
									</button>
								)}
							</>
						)}
						{selected_task && subtasks.length < MAX_SUBTASKS && (
							<div className="mt-[16]">
								<QuickAddSubtask
									key={selected_task.id}
									board_id={board_id}
									column_id={selected_task.column_id}
									task_id={selected_task.id}
								/>
							</div>
						)}
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

					<Button variant="secondary" className="w-full" onClick={() => setModal("view_task", false)}>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ViewTaskModal;
