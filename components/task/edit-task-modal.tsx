"use client";

/* REACT */
import { useEffect, useRef, useState } from "react";

/* NEXT */
import { useParams } from "next/navigation";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SortableSubtaskField from "@/components/task/sortable-subtask-field";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";

/* QUERIES */
import { useGetTaskManagementBoard } from "@/hooks/queries/task-management-board.query";

/* MUTATIONS */
import { useEditTask } from "@/hooks/mutations/task.mutation";

/* HOOKS */
import { useSelectedTask } from "@/hooks/use-selected-task";

/* SCHEMA */
import { task_schema, TaskSchemaType, MAX_SUBTASKS } from "@/schema/task-schema";

/* CONSTANTS */
import { MAX_TASK_TAGS } from "@/schema/tag-schema";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* UTILITIES */
import { cn } from "@/lib/utils";
import { getContrastColor } from "@/lib/helpers";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdDragIndicator } from "react-icons/md";

const EditTaskModal = () => {

	const { board_id } = useParams() as { board_id: string };

	const setModal = useTaskStore((state) => state.setModal);
	const modals = useTaskStore((state) => state.modals);
	const selected_task = useSelectedTask();
	const { board } = useGetTaskManagementBoard(board_id);
	const { editTask, isPending } = useEditTask({
		onSuccess: () => setModal("edit_task", false)
	});

	const form = useForm<TaskSchemaType>({
		resolver: zodResolver(task_schema),
		defaultValues: {
			title: "",
			description: "",
			sub_tasks: [],
			column_id: "1"
		}
	});

	const errors = form.formState.errors;

	const {
		fields: sub_tasks,
		append,
		remove,
		replace
	} = useFieldArray({
		control: form.control,
		name: "sub_tasks",
		keyName: "temp_id"
	});

	const [drag_sorted_keys, setDragSortedKeys] = useState<string[] | null>(null);
	const snapshot_ref = useRef<TaskSchemaType["sub_tasks"]>([]);
	const sorted_keys = drag_sorted_keys ?? sub_tasks.map((s) => s.temp_id);

	const selected_tag_ids = form.watch("tag_ids") || [];

	/**
	 * DOCU: Toggles a tag's selection state for the task. <br>
	 * Triggered: On clicking a tag pill in the edit task modal. <br>
	 * Last Updated: April 09, 2026
	 * @author Jhones
	 */
	const toggleTag = (tag_id: string) => {
		const updated = selected_tag_ids.includes(tag_id)
			? selected_tag_ids.filter((id) => id !== tag_id)
			: selected_tag_ids.length < MAX_TASK_TAGS
				? [...selected_tag_ids, tag_id]
				: selected_tag_ids;
		form.setValue("tag_ids", updated);
	};

	const onEditTaskSubmit: SubmitHandler<TaskSchemaType> = (data) => {
		if (!selected_task) return;

		editTask({
			id: selected_task.id,
			board_id,
			title: data.title,
			description: data.description,
			sub_tasks: data.sub_tasks.map((subtask) => ({
				id: subtask.id,
				title: subtask.title,
				is_new: subtask.is_new
			})),
			tag_ids: data.tag_ids
		});
	};

	/**
	 * DOCU: Captures the current subtasks state before dragging starts for rollback on cancel. <br>
	 * Triggered: When a subtask field starts being dragged. <br>
	 * Last Updated: April 05, 2026
	 * @author Jhones
	 */
	const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
		snapshot_ref.current = form.getValues("sub_tasks");
		setDragSortedKeys(sub_tasks.map((s) => s.temp_id));
	};

	/**
	 * DOCU: Handles the drag over event to reorder subtask fields visually via sorted keys. <br>
	 * Triggered: When a dragged subtask field is hovering over another subtask field. <br>
	 * Last Updated: April 05, 2026
	 * @author Jhones
	 */
	const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = (event) => {
		setDragSortedKeys((prev) => {
			if (!prev) return null;
			const items = prev.map((key) => ({ id: key }));
			const reordered = move(items, event);
			return reordered.map((item) => item.id);
		});
	};

	/**
	 * DOCU: Commits the reordered subtasks to the form state on drag end, or reverts on cancel. <br>
	 * Triggered: When a dragged subtask field is dropped. <br>
	 * Last Updated: April 05, 2026
	 * @author Jhones
	 */
	const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = (event) => {
		if (!event.canceled && drag_sorted_keys) {
			const current_values = form.getValues("sub_tasks");
			const new_values = drag_sorted_keys.map((key) => {
				const field_index = sub_tasks.findIndex((s) => s.temp_id === key);
				return current_values[field_index];
			});
			replace(new_values);
		}
		setDragSortedKeys(null);
	};

	useEffect(() => {
		if (selected_task && modals.edit_task) {
			form.reset({
				id: selected_task.id,
				title: selected_task.title,
				description: selected_task.description,
				column_id: selected_task.column_id,
				sub_tasks: selected_task.subtasks.map((subtask) => ({
					id: subtask.id,
					title: subtask.title
				})),
				tag_ids: selected_task.tags.map((tag) => tag.id)
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modals.edit_task]);

	return (
		<Dialog
			open={modals.edit_task}
			onOpenChange={(value) => setModal("edit_task", value)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg">Edit Task</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						className="flex flex-col gap-[24]"
						onSubmit={form.handleSubmit(onEditTaskSubmit)}
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<Input
										{...field}
										type="text"
										placeholder="e.g. Take coffee break"
										error={errors.title?.message}
									/>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<Textarea
										{...field}
										placeholder="e.g. It's always good to take a break. This 15 minute break will  recharge the batteries a little."
										className="h-[112]"
										error={errors.description?.message}
									/>
								</FormItem>
							)}
						/>

						{board?.tags && board.tags.length > 0 && (
							<FormItem>
								<FormLabel>Tags</FormLabel>
								<div className="flex flex-wrap gap-[8]">
									{board.tags.map((tag) => {
										const is_selected = selected_tag_ids.includes(tag.id);
										const is_limit_reached = selected_tag_ids.length >= MAX_TASK_TAGS && !is_selected;
										return (
											<button
												key={tag.id}
												type="button"
												className={cn(
													"t-[11] font-bold px-[10] py-[3] rounded-full cursor-pointer transition-all",
													is_selected && "ring-2 ring-offset-2 ring-primary dark:ring-offset-dark-grey",
													is_limit_reached && "opacity-30 cursor-not-allowed"
												)}
												style={{
													backgroundColor: tag.color,
													color: getContrastColor(tag.color)
												}}
												onClick={() => toggleTag(tag.id)}
												disabled={isPending || is_limit_reached}
											>
												{tag.name}
											</button>
										);
									})}
								</div>
							</FormItem>
						)}

						<FormItem>
							<FormLabel>Subtasks</FormLabel>
							<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
								<div className="flex flex-col gap-[12]">
									{sorted_keys.map((key, visual_index) => {
										const field_index = sub_tasks.findIndex((s) => s.temp_id === key);
										if (field_index === -1) return null;
										return (
											<SortableSubtaskField key={key} id={key} index={visual_index} disabled={isPending}>
												<FormField
													control={form.control}
													name={`sub_tasks.${field_index}.title`}
													render={({ field }) => (
														<>
															<Input
																{...field}
																defaultValue={field.value}
																value={undefined}
																type="text"
																placeholder="e.g. Done"
																error={errors.sub_tasks?.[field_index]?.title?.message}
																floating_error
															/>
															<button
																type="button"
																className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200 translate-x-2.5"
																onClick={() => remove(field_index)}
															>
																<IoIosClose />
															</button>
														</>
													)}
												/>
											</SortableSubtaskField>
										);
									})}
								</div>
								<DragOverlay dropAnimation={null}>
									{(source) => {
										const field_index = sub_tasks.findIndex((s) => s.temp_id === source.id);
										if (field_index === -1) return null;
										const value = form.getValues(`sub_tasks.${field_index}.title`);
										return (
											<div className="flex items-center rounded-md bg-foreground drop-shadow-md">
												<span className="text-primary -translate-x-0.5">
													<MdDragIndicator size={16} />
												</span>
												<Input type="text" value={value || ""} placeholder="e.g. Done" readOnly />
											</div>
										);
									}}
								</DragOverlay>
							</DragDropProvider>

							{sub_tasks.length < MAX_SUBTASKS && (
								<Button
									type="button"
									variant="secondary"
									onClick={() => append({ title: "" })}
								>
									<FaPlus /> Add New Subtask
								</Button>
							)}
						</FormItem>

						<div className="flex flex-col gap-[12]">
							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending ? "Saving..." : "Save Changes"}
							</Button>
							<Button type="button" variant="secondary" className="w-full" disabled={isPending} onClick={() => setModal("edit_task", false)}>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default EditTaskModal;
