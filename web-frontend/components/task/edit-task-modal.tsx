"use client";

/* NEXT */
import { useEffect } from "react";
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

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* SCHEMA */
import { task_schema, TaskSchemaType } from "@/schema/task-schema";

/* STORE */
import { useTaskStore } from "@/store/task.store";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";

const EditTaskModal = () => {

	const { board_id } = useParams() as { board_id: string };

	const setModal = useTaskStore((state) => state.setModal);
	const modals = useTaskStore((state) => state.modals);
	const selected_task = useTaskStore((state) => state.selected_task);
	const { board } = useGetBoard(board_id);

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
		name: "sub_tasks"
	});

	const onEditTaskSubmit: SubmitHandler<TaskSchemaType> = (data) => {
		console.log(data);
	};

	useEffect(() => {
		if (selected_task && modals.edit_task) {
			form.reset(selected_task);
		}
	}, [modals.edit_task, form, selected_task]);

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
										key={column.id}
										control={form.control}
										name={`sub_tasks.${index}.title`}
										render={({ field }) => (
											<div className="flex items-center">
												<Input
													{...field}
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

								<Button
									type="button"
									variant="secondary"
									onClick={() => append({ title: "" })}
								>
									<FaPlus /> Add New Subtask
								</Button>
							</div>
						</FormItem>

						<FormItem>
							<FormLabel>Status</FormLabel>
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

										<SelectContent className="">
											{
												board?.columns?.map((column) => (
													<SelectItem
														key={column.id}
														value={column.id}
													>
														{column.title}
													</SelectItem>
												))
											}
										</SelectContent>
									</Select>
								)}
							/>
						</FormItem>

						<Button type="submit" className="w-full">
							Save Changes
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default EditTaskModal;
