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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import SortableSubtaskField from "@/components/task/sortable-subtask-field";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";

/* SCHEMA */
import { task_schema, TaskSchemaType, MAX_SUBTASKS } from "@/schema/task-schema";

/* CONSTANTS */
import { MAX_TASK_TAGS } from "@/schema/tag-schema";

/* UTILITIES */
import { cn } from "@/lib/utils";
import { getContrastColor } from "@/lib/helpers";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* MUTATIONS */
import { useCreateTask } from "@/hooks/mutations/task.mutation";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdDragIndicator } from "react-icons/md";

const CreateTaskModal = () => {

	const { board_id } = useParams() as { board_id: string };

	const setModal = useTaskStore((state) => state.setModal);
	const modals = useTaskStore((state) => state.modals);
	const { board } = useGetBoard(board_id);
	const { createTask, isPending } = useCreateTask({
		onSuccess: () => setModal("add_task", false)
	});

	const form = useForm<TaskSchemaType>({
		resolver: zodResolver(task_schema),
		defaultValues: {
			title: "",
			description: "",
			sub_tasks: [],
			column_id: board?.columns?.[0]?.id || ""
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
	 * Triggered: On clicking a tag pill in the create task modal. <br>
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

	const onCreateTaskSubmit: SubmitHandler<TaskSchemaType> = (data) => {
		createTask({
			title: data.title,
			description: data.description,
			column_id: data.column_id,
			board_id,
			sub_tasks: data.sub_tasks.map(({ title }) => ({ title })),
			tag_ids: data.tag_ids && data.tag_ids.length > 0 ? data.tag_ids : undefined
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
		if (modals.add_task) {
			form.reset({
				title: "",
				description: "",
				sub_tasks: [],
				column_id: board?.columns?.[0]?.id || "",
			tag_ids: []
			});
		}
	}, [modals.add_task, form, board]);

	return (
		<Dialog
			open={modals.add_task}
			onOpenChange={(value) => setModal("add_task", value)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg">Add New Task</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						className="flex flex-col gap-[24]"
						onSubmit={form.handleSubmit(onCreateTaskSubmit)}
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
									disabled={isPending}
								>
									<FaPlus /> Add New Subtask
								</Button>
							)}
						</FormItem>

						<FormItem>
							<FormLabel>Column</FormLabel>
							<FormField
								control={form.control}
								name="column_id"
								render={({ field: { value, onChange } }) => (
									<Select
										value={value}
										onValueChange={(value) => onChange(value)}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select Status" />
										</SelectTrigger>

										<SelectContent>
											{
												board?.columns?.map((column) => (
													<SelectItem
														key={column.id}
														value={column.id}
													>
														{column.name}
													</SelectItem>
												))
											}
										</SelectContent>
									</Select>
								)}
							/>
						</FormItem>

						<div className="flex flex-col gap-[12]">
							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending ? "Creating..." : "Create Task"}
							</Button>
							<Button type="button" variant="secondary" className="w-full" disabled={isPending} onClick={() => setModal("add_task", false)}>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateTaskModal;
