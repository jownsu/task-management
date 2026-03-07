"use client";

/* NEXT */
import { useEffect, useState } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DeleteColumnModal from "@/components/columns/delete-column-modal";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";

/* SCHEMA */
import { edit_board_schema, EditBoardSchema } from "@/schema/board-schema";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* MUTATIONS */
import { useEditBoard } from "@/hooks/mutations/board.mutation";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";

/* CONSTANTS */
import { Column } from "@/types";

const EditBoardmodal = () => {
	const board_modals = useBoardStore((state) => state.modals);
	const setModal = useBoardStore((state) => state.setModal);
	const selected_board = useBoardStore((state) => state.selected_board);
	const [selected_column, setSelectedColumn] = useState<Column & { index: number }>()
	const [open_delete_column_modal, setDeleteColumnModal] = useState(false)

	const form = useForm<EditBoardSchema>({
		resolver: zodResolver(edit_board_schema)
	});

	const errors = form.formState.errors;

	const {
		fields: columns,
		append,
		remove
	} = useFieldArray({
		control: form.control,
		name: "columns",
		keyName: "temp_id"
	});

	const { editBoard, isPending } = useEditBoard({
		onSuccess: () => {
			setModal("edit_board", false);
		}
	});

	const onEditBoardSubmit: SubmitHandler<EditBoardSchema> = (data) => {
		editBoard(data);
	};

	useEffect(() => {
		if(selected_board && board_modals.edit_board){
			form.reset({
				id: selected_board.id,
				name: selected_board.name,
				columns: selected_board.columns?.map(column => ({ 
					id: column.id, 
					name: column.name, 
					is_new: false 
				}))
			});
		}
	}, [form, board_modals.edit_board, selected_board]);

	return (
		<Dialog
			open={board_modals.edit_board && !open_delete_column_modal}
			onOpenChange={(value) => setModal("edit_board", value)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg">Edit Board</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						className="flex flex-col gap-[24]"
						onSubmit={form.handleSubmit(onEditBoardSubmit)}
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Board Name</FormLabel>
									<Input
										{...field}
										type="text"
										placeholder="e.g. Web Design"
										error={errors.name?.message}
									/>
								</FormItem>
							)}
						/>

						<FormItem>
							<FormLabel>Board Columns</FormLabel>
							<div className="flex flex-col gap-[12]">
								{columns.map((column, index) => (
									<FormField
										key={column.temp_id}
										control={form.control}
										name={`columns.${index}.name`}
										render={({ field }) => (
											<div className="flex items-center">
												<Input
													{...field}
													type="text"
													placeholder="e.g. Done"
													error={errors.columns?.[index]?.name?.message}
													floating_error
												/>
												{
													column.is_new 
													? (
														<button
															type="button"
															className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200  translate-x-2.5"
															onClick={() => remove(index)}
														>
															<IoIosClose />
														</button>
													)
													: (
														<button
															type="button"
															className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200  translate-x-2.5 scale-75"
															onClick={() => {
																if(column.id){
																	setDeleteColumnModal(true);
																	setSelectedColumn({
																		id: column.id,
																		name: column.name,
																		taskOrder: [],
																		index
																	});
																}
															}}
														>
															<MdDeleteOutline />
														</button>
													)
												}
											</div>
										)}
									/>
								))}

								<Button
									type="button"
									variant="secondary"
									onClick={() => append({ name: "", is_new: true })}
									disabled={isPending}
								>
									<FaPlus /> Add New Column
								</Button>
							</div>
						</FormItem>

						<Button 
							type="submit" 
							className="w-full"
							disabled={isPending}
						>
							{isPending ? "Saving..." : "Save Changes"}
						</Button>
					</form>
				</Form>
			</DialogContent>

			<DeleteColumnModal 
				open={open_delete_column_modal}
				onOpenChange={setDeleteColumnModal}
				selected_column={selected_column}
				onDeleteColumn={() => {
					if(selected_column?.index !== undefined){
						remove(selected_column.index);
						setDeleteColumnModal(false);
					}
				}}
			/>
		</Dialog>
	);
};

export default EditBoardmodal;
