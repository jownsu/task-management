"use client";

/* REACT */
import { useEffect, useRef, useState } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SortableColumnField from "@/components/board/sortable-column-field";
import ColorPicker from "@/components/ui/color-picker";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";

/* SCHEMA */
import { edit_habit_board_schema, EditHabitBoardSchema, MAX_HABITS } from "@/schema/board-schema";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* MUTATIONS */
import { useEditHabitTrackerBoard } from "@/hooks/mutations/board.mutation";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdDragIndicator } from "react-icons/md";

/* CONSTANTS */
import { DEFAULT_COLUMN_THEME } from "@/constants";

/**
 * DOCU: Edit board modal for HABIT_TRACKER boards. Allows renaming the board and editing/adding/removing habits with drag-to-reorder. <br>
 * Triggered: From the navbar action options on a habit-tracker board. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const EditHabitBoardModal = () => {
	const board_modals = useBoardStore((state) => state.modals);
	const setModal = useBoardStore((state) => state.setModal);
	const selected_board = useBoardStore((state) => state.selected_board);

	const form = useForm<EditHabitBoardSchema>({
		resolver: zodResolver(edit_habit_board_schema)
	});

	const errors = form.formState.errors;

	const {
		fields: habits,
		append,
		remove,
		replace
	} = useFieldArray({
		control: form.control,
		name: "habits",
		keyName: "temp_id"
	});

	const [drag_sorted_keys, setDragSortedKeys] = useState<string[] | null>(null);
	const snapshot_ref = useRef<EditHabitBoardSchema["habits"]>([]);
	const sorted_keys = drag_sorted_keys ?? habits.map((h) => h.temp_id);

	const { editBoard, isPending } = useEditHabitTrackerBoard({
		onSuccess: () => {
			setModal("edit_board", false);
		}
	});

	/**
	 * DOCU: Captures the current habits state before dragging starts for rollback on cancel. <br>
	 * Triggered: When a habit field starts being dragged. <br>
	 * Last Updated: April 25, 2026
	 * @author Jhones
	 */
	const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
		snapshot_ref.current = form.getValues("habits");
		setDragSortedKeys(habits.map((h) => h.temp_id));
	};

	/**
	 * DOCU: Handles the drag over event to reorder habits visually via sorted keys. <br>
	 * Triggered: When a dragged habit field is hovering over another habit field. <br>
	 * Last Updated: April 25, 2026
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
	 * DOCU: Commits the reordered habits to the form state on drag end, or reverts on cancel. <br>
	 * Triggered: When a dragged habit field is dropped. <br>
	 * Last Updated: April 25, 2026
	 * @author Jhones
	 */
	const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = (event) => {
		if (!event.canceled && drag_sorted_keys) {
			const current_values = form.getValues("habits");
			const new_values = drag_sorted_keys.map((key) => {
				const field_index = habits.findIndex((h) => h.temp_id === key);
				return current_values[field_index];
			});
			replace(new_values);
		}
		setDragSortedKeys(null);
	};

	const onEditBoardSubmit: SubmitHandler<EditHabitBoardSchema> = (data) => {
		editBoard(data);
	};

	useEffect(() => {
		if (selected_board && board_modals.edit_board) {
			form.reset({
				id: selected_board.id,
				name: selected_board.name,
				habits: selected_board.habits?.map((habit) => ({
					id: habit.id,
					name: habit.name,
					theme: habit.theme,
					goal: habit.goal,
					is_new: false
				}))
			});
		}
	}, [form, board_modals.edit_board, selected_board]);

	return (
		<Dialog
			open={board_modals.edit_board}
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
										placeholder="e.g. Daily Routine"
										error={errors.name?.message}
									/>
								</FormItem>
							)}
						/>

						<FormItem>
							<FormLabel>Habits</FormLabel>
							<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
								<div className="flex flex-col gap-[12]">
									{sorted_keys.map((key, visual_index) => {
										const field_index = habits.findIndex((h) => h.temp_id === key);
										if (field_index === -1) return null;
										return (
											<SortableColumnField key={key} id={key} index={visual_index} disabled={isPending}>
												<Controller
													control={form.control}
													name={`habits.${field_index}.theme`}
													render={({ field: theme_field }) => (
														<ColorPicker
															value={theme_field.value || DEFAULT_COLUMN_THEME}
															onChange={theme_field.onChange}
															disabled={isPending}
															className="mx-[8]"
														/>
													)}
												/>
												<FormField
													control={form.control}
													name={`habits.${field_index}.name`}
													render={({ field }) => (
														<Input
															{...field}
															defaultValue={field.value}
															value={undefined}
															type="text"
															placeholder="e.g. Journal"
															error={errors.habits?.[field_index]?.name?.message}
															floating_error
														/>
													)}
												/>
												<FormField
													control={form.control}
													name={`habits.${field_index}.goal`}
													render={({ field }) => (
														<Input
															{...field}
															defaultValue={field.value}
															value={undefined}
															type="number"
															min={0}
															placeholder="Goal"
															containerClassName="w-[80] shrink-0 ml-[8]"
															error={errors.habits?.[field_index]?.goal?.message}
															floating_error
														/>
													)}
												/>
												<button
													type="button"
													className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200 translate-x-2.5"
													onClick={() => remove(field_index)}
												>
													<IoIosClose />
												</button>
											</SortableColumnField>
										);
									})}
								</div>
								<DragOverlay dropAnimation={null}>
									{(source) => {
										const field_index = habits.findIndex((h) => h.temp_id === source.id);
										if (field_index === -1) return null;
										const value = form.getValues(`habits.${field_index}.name`);
										return (
											<div className="flex items-center rounded-md bg-foreground drop-shadow-md">
												<span className="text-primary -translate-x-0.5">
													<MdDragIndicator size={16} />
												</span>
												<Input type="text" value={value || ""} placeholder="e.g. Journal" readOnly />
											</div>
										);
									}}
								</DragOverlay>
							</DragDropProvider>

							{habits.length < MAX_HABITS && (
								<Button
									type="button"
									variant="secondary"
									className="mt-[12]"
									onClick={() => append({ name: "", theme: DEFAULT_COLUMN_THEME, goal: 20, is_new: true })}
									disabled={isPending}
								>
									<FaPlus /> Add New Habit
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
		</Dialog>
	);
};

export default EditHabitBoardModal;
