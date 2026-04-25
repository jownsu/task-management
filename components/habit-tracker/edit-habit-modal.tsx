"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useEffect } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ColorPicker from "@/components/ui/color-picker";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

/* SCHEMA */
import { edit_habit_schema, EditHabitSchema } from "@/schema/board-schema";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* MUTATIONS */
import { useEditHabit } from "@/hooks/mutations/habit.mutation";

/* CONSTANTS */
import { DEFAULT_COLUMN_THEME } from "@/constants";

/**
 * DOCU: Single-habit edit modal. Reads board_id from URL params and the target habit from the board store. Submits to editHabitAction. <br>
 * Triggered: When the user clicks the edit icon next to a habit name in the grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const EditHabitModal = () => {
	const { board_id } = useParams() as { board_id: string };
	const modals = useBoardStore((state) => state.modals);
	const setModal = useBoardStore((state) => state.setModal);
	const selected_habit = useBoardStore((state) => state.selected_habit);

	const form = useForm<EditHabitSchema>({
		resolver: zodResolver(edit_habit_schema),
		defaultValues: {
			id: "",
			board_id,
			name: "",
			theme: DEFAULT_COLUMN_THEME,
			goal: 20
		}
	});

	const errors = form.formState.errors;

	const { editHabit, isPending } = useEditHabit({
		onSuccess: () => {
			setModal("edit_habit", false);
		}
	});

	useEffect(() => {
		if (modals.edit_habit && selected_habit) {
			form.reset({
				id: selected_habit.id,
				board_id,
				name: selected_habit.name,
				theme: selected_habit.theme,
				goal: selected_habit.goal
			});
		}
	}, [modals.edit_habit, selected_habit, board_id, form]);

	const onSubmit: SubmitHandler<EditHabitSchema> = (data) => {
		editHabit(data);
	};

	return (
		<Dialog open={modals.edit_habit} onOpenChange={(value) => !isPending && setModal("edit_habit", value)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg">Edit Habit</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form className="flex flex-col gap-[24]" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Habit Name</FormLabel>
									<Input
										{...field}
										type="text"
										placeholder="e.g. Journal"
										error={errors.name?.message}
									/>
								</FormItem>
							)}
						/>

						<FormItem>
							<FormLabel>Theme</FormLabel>
							<Controller
								control={form.control}
								name="theme"
								render={({ field }) => (
									<ColorPicker
										value={field.value || DEFAULT_COLUMN_THEME}
										onChange={field.onChange}
										disabled={isPending}
									/>
								)}
							/>
						</FormItem>

						<FormField
							control={form.control}
							name="goal"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Goal (days per month)</FormLabel>
									<Input
										{...field}
										type="number"
										min={0}
										placeholder="20"
										error={errors.goal?.message}
									/>
								</FormItem>
							)}
						/>

						<div className="flex flex-col gap-[12]">
							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending ? "Saving..." : "Save Changes"}
							</Button>
							<Button type="button" variant="secondary" className="w-full" disabled={isPending} onClick={() => setModal("edit_habit", false)}>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default EditHabitModal;
