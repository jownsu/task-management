"use client";

/* REACT */
import { useRef, useState } from "react";

/* COMPONENTS */
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SortableColumnField from "@/components/board/sortable-column-field";
import ColorPicker from "@/components/ui/color-picker";

/* PLUGINS */
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

/* SCHEMA */
import { AddBoardSchema, MAX_COLUMNS } from "@/schema/board-schema";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { MdDragIndicator } from "react-icons/md";

/* CONSTANTS */
import { DEFAULT_COLUMN_THEME } from "@/constants";

interface Props {
	disabled?: boolean;
}

/**
 * DOCU: Form fields for creating a task-management (kanban) board. Owns the columns field array and drag-and-drop reorder UX. <br>
 * Triggered: From CreateBoardmodal when the selected type is TASK_MANAGEMENT. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
const TaskManagementFields = ({ disabled }: Props) => {
	const form = useFormContext<AddBoardSchema>();
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

	const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
		snapshot_ref.current = form.getValues("columns");
		setDragSortedKeys(columns.map((col) => col.id));
	};

	const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = (event) => {
		setDragSortedKeys((prev) => {
			if (!prev) return null;
			const items = prev.map((key) => ({ id: key }));
			const reordered = move(items, event);
			return reordered.map((item) => item.id);
		});
	};

	const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = (event) => {
		if (!event.canceled && drag_sorted_keys) {
			const current_values = form.getValues("columns");
			if (!current_values) {
				setDragSortedKeys(null);
				return;
			}
			const new_values = drag_sorted_keys.map((key) => {
				const field_index = columns.findIndex((col) => col.id === key);
				return current_values[field_index];
			});
			replace(new_values);
		}
		setDragSortedKeys(null);
	};

	return (
		<FormItem>
			<FormLabel>Board Columns</FormLabel>
			<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<div className="flex flex-col gap-[12]">
					{sorted_keys.map((key, visual_index) => {
						const field_index = columns.findIndex((col) => col.id === key);
						if (field_index === -1) return null;
						return (
							<SortableColumnField key={key} id={key} index={visual_index} disabled={disabled}>
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
														disabled={disabled}
														className="mx-[8]"
													/>
												)}
											/>
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
				<Button type="button" variant="secondary" className="mt-[12]" onClick={() => append({ name: "", theme: DEFAULT_COLUMN_THEME })} disabled={disabled}>
					<FaPlus /> Add New Column
				</Button>
			)}
		</FormItem>
	);
};

export default TaskManagementFields;
