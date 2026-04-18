"use client";

/* NEXT */
import { useEffect, useRef, useState } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DeleteColumnModal from "@/components/columns/delete-column-modal";
import SortableColumnField from "@/components/board/sortable-column-field";
import ColorPicker from "@/components/ui/color-picker";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";

/* SCHEMA */
import { edit_board_schema, EditBoardSchema, MAX_COLUMNS } from "@/schema/board-schema";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* MUTATIONS */
import { useEditTaskManagementBoard } from "@/hooks/mutations/board.mutation";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdDeleteOutline, MdDragIndicator } from "react-icons/md";

/* TYPES */
import { Column } from "@/types";

/* CONSTANTS */
import { DEFAULT_COLUMN_THEME } from "@/constants";

const EditBoardmodal = () => {
	const board_modals = useBoardStore((state) => state.modals);
	const setModal = useBoardStore((state) => state.setModal);
	const selected_board = useBoardStore((state) => state.selected_board);
	const [selected_column, setSelectedColumn] = useState<Column & { index: number }>();
	const [open_delete_column_modal, setDeleteColumnModal] = useState(false);

	const form = useForm<EditBoardSchema>({
		resolver: zodResolver(edit_board_schema)
	});

	const errors = form.formState.errors;

	const {
		fields: columns,
		append,
		remove,
		replace
	} = useFieldArray({
		control: form.control,
		name: "columns",
		keyName: "temp_id"
	});

	const [drag_sorted_keys, setDragSortedKeys] = useState<string[] | null>(null);
	const snapshot_ref = useRef<EditBoardSchema["columns"]>([]);
	const sorted_keys = drag_sorted_keys ?? columns.map((col) => col.temp_id);

	const { editBoard, isPending } = useEditTaskManagementBoard({
		onSuccess: () => {
			setModal("edit_board", false);
		}
	});

	/**
	 * DOCU: Captures the current columns state before dragging starts for rollback on cancel. <br>
	 * Triggered: When a column field starts being dragged. <br>
	 * Last Updated: March 25, 2026
	 * @author Jhones
	 */
	const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
		snapshot_ref.current = form.getValues("columns");
		setDragSortedKeys(columns.map((col) => col.temp_id));
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
				const field_index = columns.findIndex((col) => col.temp_id === key);
				return current_values[field_index];
			});
			replace(new_values);
		}
		setDragSortedKeys(null);
	};

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
					theme: column.theme,
					is_new: false
				})),
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
							<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
								<div className="flex flex-col gap-[12]">
									{sorted_keys.map((key, visual_index) => {
										const field_index = columns.findIndex((col) => col.temp_id === key);
										if (field_index === -1) return null;
										const column = columns[field_index];
										return (
											<SortableColumnField key={key} id={key} index={visual_index} disabled={isPending}>
												<FormField
													control={form.control}
													name={`columns.${field_index}.name`}
													render={({ field }) => (
														<>
															<Controller
																control={form.control}
																name={`columns.${field_index}.theme`}
																render={({ field: theme_field }) => (
																	<ColorPicker
																		value={theme_field.value || DEFAULT_COLUMN_THEME}
																		onChange={theme_field.onChange}
																		disabled={isPending}
																		className="mx-[8]"
																	/>
																)}
															/>
															<Input
																{...field}
																type="text"
																placeholder="e.g. Done"
																error={errors.columns?.[field_index]?.name?.message}
																floating_error
															/>
															{
																column.is_new
																? (
																	<button
																		type="button"
																		className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200 translate-x-2.5"
																		onClick={() => remove(field_index)}
																	>
																		<IoIosClose />
																	</button>
																)
																: (
																	<button
																		type="button"
																		className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200 translate-x-2.5 scale-75"
																		onClick={() => {
																			if(column.id){
																				setDeleteColumnModal(true);
																				setSelectedColumn({
																					id: column.id,
																					name: column.name,
																					theme: form.getValues(`columns.${field_index}.theme`) || DEFAULT_COLUMN_THEME,
																					taskOrder: [],
																					index: field_index
																				});
																			}
																		}}
																	>
																		<MdDeleteOutline />
																	</button>
																)
															}
														</>
													)}
												/>
											</SortableColumnField>
										);
									})}
								</div>
								<DragOverlay dropAnimation={null}>
									{(source) => {
										const field_index = columns.findIndex((col) => col.temp_id === source.id);
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
								<Button
									type="button"
									variant="secondary"
									className="mt-[12]"
									onClick={() => append({ name: "", theme: DEFAULT_COLUMN_THEME, is_new: true })}
									disabled={isPending}
								>
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
								{isPending ? "Saving..." : "Save Changes"}
							</Button>
							<Button type="button" variant="secondary" className="w-full" disabled={isPending} onClick={() => setModal("edit_board", false)}>
								Cancel
							</Button>
						</div>
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
