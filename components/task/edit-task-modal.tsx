"use client";

/* NEXT */
import { useEffect } from "react";
import { useParams } from "next/navigation";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";

/* MUTATIONS */
import { useEditTask } from "@/hooks/mutations/task.mutation";

/* HOOKS */
import { useSelectedTask } from "@/hooks/use-selected-task";

/* SCHEMA */
import { task_schema, TaskSchemaType, MAX_SUBTASKS } from "@/schema/task-schema";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";

const EditTaskModal = () => {

	const { board_id } = useParams() as { board_id: string };

	const setModal = useTaskStore((state) => state.setModal);
	const modals = useTaskStore((state) => state.modals);
	const selected_task = useSelectedTask();
	const { editTask, isPending } = useEditTask({
		onSuccess: () => setModal("edit_task", false)
	});

	const form = useForm<TaskSchemaType>({
		resolver: zodResolver(task_schema),
		defaultValues: {
			title: "",
			description: "",
			sub_tasks: [
				{
					id: crypto.randomUUID(),
					title: ""
				},
				{
					id: crypto.randomUUID(),
					title: ""
				}
			],
			column_id: "1"
		}
	});

	const errors = form.formState.errors;

	const {
		fields: sub_tasks,
		append,
		remove
	} = useFieldArray({
		control: form.control,
		name: "sub_tasks",
		keyName: "temp_id"
	});

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
			}))
		});
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
				}))
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

						<FormItem>
							<FormLabel>Subtasks</FormLabel>
							<div className="flex flex-col gap-[12]">
								{sub_tasks.map((column, index) => (
									<FormField
										key={column.temp_id}
										control={form.control}
										name={`sub_tasks.${index}.title`}
										render={({ field }) => (
											<div className="flex items-center">
												<Input
													{...field}
													defaultValue={field.value}
													value={undefined}
													type="text"
													placeholder="e.g. Done"
													error={errors.sub_tasks?.[index]?.title?.message}
													floating_error
												/>
												<button
													type="button"
													className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200  translate-x-2.5"
													onClick={() => remove(index)}
												>
													<IoIosClose />
												</button>
											</div>
										)}
									/>
								))}

								{sub_tasks.length < MAX_SUBTASKS && (
									<Button
										type="button"
										variant="secondary"
										onClick={() => append({ title: "" })}
									>
										<FaPlus /> Add New Subtask
									</Button>
								)}
							</div>
						</FormItem>

						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? "Saving..." : "Save Changes"}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default EditTaskModal;
