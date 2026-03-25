"use client";

/* REACT */
import { useEffect, useRef, useState } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SortableColumnField from "@/components/board/sortable-column-field";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";

/* SCHEMA */
import { AddBoardSchema, add_board_schema, MAX_COLUMNS } from "@/schema/board-schema";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* MUTATIONS */
import { useCreateBoard } from "@/hooks/mutations/board.mutation";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdDragIndicator } from "react-icons/md";

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
		remove,
		replace
	} = useFieldArray({
		control: form.control,
		name: "columns"
	});

	const [drag_sorted_keys, setDragSortedKeys] = useState<string[] | null>(null);
	const snapshot_ref = useRef<AddBoardSchema["columns"]>([]);
	const sorted_keys = drag_sorted_keys ?? columns.map((col) => col.id);

	const { createBoard, isPending } = useCreateBoard({
		onSuccess: () => {
			setModal("add_board", false);
		}
	});

	/**
	 * DOCU: Captures the current columns state before dragging starts for rollback on cancel. <br>
	 * Triggered: When a column field starts being dragged. <br>
	 * Last Updated: March 23, 2026
	 * @author Jhones
	 */
	const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
		snapshot_ref.current = form.getValues("columns");
		setDragSortedKeys(columns.map((col) => col.id));
	};

	/**
	 * DOCU: Handles the drag over event to reorder columns visually via sorted keys. <br>
	 * Triggered: When a dragged column field is hovering over another column field. <br>
	 * Last Updated: March 25, 2026
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
	 * DOCU: Commits the reordered columns to the form state on drag end, or reverts on cancel. <br>
	 * Triggered: When a dragged column field is dropped. <br>
	 * Last Updated: March 25, 2026
	 * @author Jhones
	 */
	const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = (event) => {
		if (!event.canceled && drag_sorted_keys) {
			const current_values = form.getValues("columns");
			const new_values = drag_sorted_keys.map((key) => {
				const field_index = columns.findIndex((col) => col.id === key);
				return current_values[field_index];
			});
			replace(new_values);
		}
		setDragSortedKeys(null);
	};

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
							<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
								<div className="flex flex-col gap-[12]">
									{sorted_keys.map((key, visual_index) => {
										const field_index = columns.findIndex((col) => col.id === key);
										if (field_index === -1) return null;
										return (
											<SortableColumnField key={key} id={key} index={visual_index} disabled={isPending}>
												<FormField
													control={form.control}
													name={`columns.${field_index}.name`}
													render={({ field }) => (
														<>
															<Input {...field} defaultValue={field.value} value={undefined} type="text" placeholder="e.g. Done" error={errors.columns?.[field_index]?.name?.message} floating_error />
															<button type="button" className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200 translate-x-2.5" onClick={() => remove(field_index)}>
																<IoIosClose />
															</button>
														</>
													)}
												/>
											</SortableColumnField>
										);
									})}
								</div>
								<DragOverlay dropAnimation={null}>
									{(source) => {
										const field_index = columns.findIndex((col) => col.id === source.id);
										if (field_index === -1) return null;
										const value = form.getValues(`columns.${field_index}.name`);
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

							{columns.length < MAX_COLUMNS && (
								<Button type="button" variant="secondary" className="mt-[12]" onClick={() => append({ name: "" })} disabled={isPending}>
									<FaPlus /> Add New Column
								</Button>
							)}
						</FormItem>

						<div className="flex flex-col gap-[12]">
							<Button
								type="submit"
								className="w-full"
								disabled={isPending}
							>
								{isPending ? "Creating board..." : "Create New Board"}
							</Button>
							<Button type="button" variant="secondary" className="w-full" disabled={isPending} onClick={() => setModal("add_board", false)}>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateBoardmodal;
