"use client";

/* NEXT */
import { useEffect } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";

/* SCHEMA */
import { AddBoardSchema, add_board_schema } from "@/schema/board-schema";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* MUTATIONS */
import { useCreateBoard } from "@/hooks/mutations/create-board.mutation";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";

const CreateBoardmodal = () => {
	const setModal = useBoardStore((state) => state.setModal);
	const modals = useBoardStore((state) => state.modals);

	const form = useForm<AddBoardSchema>({
		resolver: zodResolver(add_board_schema),
		defaultValues: {
			name: "",
			columns: [
				{ name: "Todo" },
				{ name: "Doing" }
			]
		}
	});

	const errors = form.formState.errors;

	const {
		fields: columns,
		append,
		remove
	} = useFieldArray({
		control: form.control,
		name: "columns"
	});

	const { createBoard, isPending } = useCreateBoard({
		onSuccess: () => {
			setModal("add_board", false);
		}
	});

	const onCreateBoardSubmit: SubmitHandler<AddBoardSchema> = (data) => {
		createBoard(data);
	};

	useEffect(() => {
		if(modals.add_board){
			form.reset();
		}
	}, [modals.add_board, form]);

	return (
		<Dialog
			open={modals.add_board}
			onOpenChange={(value) => setModal("add_board", value)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg">Add New Board</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						className="flex flex-col gap-[24]"
						onSubmit={form.handleSubmit(onCreateBoardSubmit)}
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
										key={column.id}
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
									onClick={() => append({ name: "" })}
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
							{isPending ? "Creating board..." : "Create New Board"}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateBoardmodal;
