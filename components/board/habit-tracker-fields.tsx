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
import { AddBoardSchema, MAX_HABITS } from "@/schema/board-schema";

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
 * DOCU: Form fields for creating a habit-tracker board. Owns the habits field array and drag-and-drop reorder UX. Each habit has name, theme, and a monthly goal. <br>
 * Triggered: From CreateBoardmodal when the selected type is HABIT_TRACKER. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
const HabitTrackerFields = ({ disabled }: Props) => {
	const form = useFormContext<AddBoardSchema>();
	const errors = form.formState.errors;

	const {
		fields: habits,
		append,
		remove,
		replace
	} = useFieldArray({
		control: form.control,
		name: "habits"
	});

	const [drag_sorted_keys, setDragSortedKeys] = useState<string[] | null>(null);
	const snapshot_ref = useRef<AddBoardSchema["habits"]>([]);
	const sorted_keys = drag_sorted_keys ?? habits.map((h) => h.id);

	const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
		snapshot_ref.current = form.getValues("habits");
		setDragSortedKeys(habits.map((h) => h.id));
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
			const current_values = form.getValues("habits");
			if (!current_values) {
				setDragSortedKeys(null);
				return;
			}
			const new_values = drag_sorted_keys.map((key) => {
				const field_index = habits.findIndex((h) => h.id === key);
				return current_values[field_index];
			});
			replace(new_values);
		}
		setDragSortedKeys(null);
	};

	return (
		<FormItem>
			<FormLabel>Habits</FormLabel>
			<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<div className="flex flex-col gap-[12]">
					{sorted_keys.map((key, visual_index) => {
						const field_index = habits.findIndex((h) => h.id === key);
						if (field_index === -1) return null;
						return (
							<SortableColumnField key={key} id={key} index={visual_index} disabled={disabled}>
								<Controller
									control={form.control}
									name={`habits.${field_index}.theme`}
									render={({ field: theme_field }) => (
										<ColorPicker
											value={theme_field.value || DEFAULT_COLUMN_THEME}
											onChange={theme_field.onChange}
											disabled={disabled}
											className="mx-[8]"
										/>
									)}
								/>
								<FormField
									control={form.control}
									name={`habits.${field_index}.name`}
									render={({ field }) => (
										<Input {...field} defaultValue={field.value} value={undefined} type="text" placeholder="e.g. Journal" error={errors.habits?.[field_index]?.name?.message} floating_error />
									)}
								/>
								<FormField
									control={form.control}
									name={`habits.${field_index}.goal`}
									render={({ field }) => (
										<Input {...field} defaultValue={field.value} value={undefined} type="number" min={0} placeholder="Goal" containerClassName="w-[80] shrink-0 ml-[8]" error={errors.habits?.[field_index]?.goal?.message} floating_error />
									)}
								/>
								<button type="button" className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200 translate-x-2.5" onClick={() => remove(field_index)}>
									<IoIosClose />
								</button>
							</SortableColumnField>
						);
					})}
				</div>
				<DragOverlay dropAnimation={null}>
					{(source) => {
						const field_index = habits.findIndex((h) => h.id === source.id);
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
				<Button type="button" variant="secondary" className="mt-[12]" onClick={() => append({ name: "", theme: DEFAULT_COLUMN_THEME, goal: 20 })} disabled={disabled}>
					<FaPlus /> Add New Habit
				</Button>
			)}
		</FormItem>
	);
};

export default HabitTrackerFields;
