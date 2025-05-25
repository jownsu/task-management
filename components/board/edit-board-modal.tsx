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
import { board_schema, BoardSchemaType } from "@/schema/board-schema";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* MUTATIONS */
import { useEditBoard } from "@/mutations/edit-board.mutation";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { useGetActiveBoard } from "@/hooks/board.hook";
import { MdDeleteOutline } from "react-icons/md";

/* CONSTANTS */
import { Column } from "@/constants/types";

const EditBoardmodal = () => {
	const board_modals = useBoardStore((state) => state.modals);
	const setBoardModal = useBoardStore((state) => state.setModal);
	const [selected_column, setSelectedColumn] = useState<Column | null>(null)
	const [open_delete_column_modal, setDeleteColumnModal] = useState(false)
	
	
	const active_board = useGetActiveBoard();

	const form = useForm<BoardSchemaType>({
		resolver: zodResolver(board_schema)
	});

	const {
		fields: columns,
		append,
		remove
	} = useFieldArray({
		control: form.control,
		name: "columns",
		keyName: "generated_id"
	});

	const { editBoard, isPending } = useEditBoard();

	const onEditBoardSubmit: SubmitHandler<BoardSchemaType> = (data) => {
		editBoard(data);
	};

	useEffect(() => {
		if(board_modals.edit_board && active_board){
			form.reset({
				id: active_board.id,
				columns: active_board.columns,
				title: active_board.title,
			});
		}
	}, [form, active_board, board_modals.edit_board]);

	return (
		<Dialog
			open={board_modals.edit_board && !open_delete_column_modal}
			onOpenChange={(value) => setBoardModal("edit_board", value)}
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
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Board Name</FormLabel>
									<Input
										{...field}
										type="text"
										placeholder="e.g. Web Design"
									/>
								</FormItem>
							)}
						/>

						<FormItem>
							<FormLabel>Board Columns</FormLabel>
							<div className="flex flex-col gap-[12]">
								{columns.map((column, index) => (
									<FormField
										key={column.id}
										control={form.control}
										name={`columns.${index}.title`}
										render={({ field }) => (
											<div className="flex items-center">
												<Input
													{...field}
													type="text"
													placeholder="e.g. Done"
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
																setDeleteColumnModal(true);
																setSelectedColumn({...column, index});
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
									onClick={() => append({ title: "", id: crypto.randomUUID(), is_new: true })}
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
