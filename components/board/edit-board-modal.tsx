"use client";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
import { useEffect } from "react";

const EditBoardmodal = () => {
	const setModal = useBoardStore((state) => state.setModal);
	const modals = useBoardStore((state) => state.modals);
	const active_board = useGetActiveBoard();

	const { editBoard, isPending } = useEditBoard();

	const form = useForm<BoardSchemaType>({
		resolver: zodResolver(board_schema)
	});

	const {
		fields: columns,
		append,
		remove
	} = useFieldArray({
		control: form.control,
		name: "columns"
	});

	const onEditBoardSubmit: SubmitHandler<BoardSchemaType> = (data) => {
		editBoard(data);
	};

	useEffect(() => {
		if(modals.edit_board && active_board){
			form.reset({
				id: active_board.id,
				columns: active_board.columns,
				title: active_board.title,
			});
		}
	}, [form, active_board, modals.edit_board]);

	return (
		<Dialog
			open={modals.edit_board}
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
		</Dialog>
	);
};

export default EditBoardmodal;
