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
import { add_habit_schema, AddHabitSchema } from "@/schema/board-schema";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* MUTATIONS */
import { useAddHabit } from "@/hooks/mutations/habit.mutation";

/* CONSTANTS */
import { DEFAULT_COLUMN_THEME } from "@/constants";

/**
 * DOCU: Single-habit creation modal. Reads board_id from the URL params; submits to addHabitAction. <br>
 * Triggered: When the user clicks "+ New Habit" below the habit grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
const AddHabitModal = () => {
	const { board_id } = useParams() as { board_id: string };
	const modals = useBoardStore((state) => state.modals);
	const setModal = useBoardStore((state) => state.setModal);

	const form = useForm<AddHabitSchema>({
		resolver: zodResolver(add_habit_schema),
		defaultValues: {
			board_id,
			name: "",
			theme: DEFAULT_COLUMN_THEME,
			goal: 20
		}
	});

	const errors = form.formState.errors;

	const { addHabit, isPending } = useAddHabit({
		onSuccess: () => {
			setModal("add_habit", false);
		}
	});

	useEffect(() => {
		if (modals.add_habit) {
			form.reset({ board_id, name: "", theme: DEFAULT_COLUMN_THEME, goal: 20 });
		}
	}, [modals.add_habit, board_id, form]);

	const onSubmit: SubmitHandler<AddHabitSchema> = (data) => {
		addHabit(data);
	};

	return (
		<Dialog open={modals.add_habit} onOpenChange={(value) => !isPending && setModal("add_habit", value)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg">Add Habit</DialogTitle>
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
								{isPending ? "Adding..." : "Add Habit"}
							</Button>
							<Button type="button" variant="secondary" className="w-full" disabled={isPending} onClick={() => setModal("add_habit", false)}>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default AddHabitModal;
