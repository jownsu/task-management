"use client";

/* REACT */
import { useEffect } from "react";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TaskManagementFields from "@/components/board/task-management-fields";
import HabitTrackerFields from "@/components/board/habit-tracker-fields";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

/* SCHEMA */
import { AddBoardSchema, add_board_schema, BoardType } from "@/schema/board-schema";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* MUTATIONS */
import { useCreateBoard } from "@/hooks/mutations/board.mutation";

/* CONSTANTS */
import { DEFAULT_COLUMN_THEME } from "@/constants";

const BOARD_FIELDS: Record<BoardType, React.ComponentType<{ disabled?: boolean }>> = {
	TASK_MANAGEMENT: TaskManagementFields,
	HABIT_TRACKER: HabitTrackerFields
};

const BOARD_SUBMIT_LABELS: Record<BoardType, string> = {
	TASK_MANAGEMENT: "Create New Board",
	HABIT_TRACKER: "Create Habit Tracker"
};

const CreateBoardmodal = () => {
	const setModal = useBoardStore((state) => state.setModal);
	const modals = useBoardStore((state) => state.modals);

	const form = useForm<AddBoardSchema>({
		resolver: zodResolver(add_board_schema),
		defaultValues: {
			name: "",
			type: "TASK_MANAGEMENT",
			columns: [
				{ name: "Todo", theme: DEFAULT_COLUMN_THEME },
				{ name: "Doing", theme: DEFAULT_COLUMN_THEME }
			],
			habits: [
				{ name: "Journal", theme: DEFAULT_COLUMN_THEME, goal: 20 }
			]
		}
	});

	const selected_type = form.watch("type");
	const errors = form.formState.errors;

	const { createBoard, isPending } = useCreateBoard({
		onSuccess: () => {
			setModal("add_board", false);
		}
	});

	const onCreateBoardSubmit: SubmitHandler<AddBoardSchema> = (data) => {
		createBoard(data);
	};

	useEffect(() => {
		if (modals.add_board) {
			form.reset();
		}
	}, [modals.add_board, form]);

	const Fields = BOARD_FIELDS[selected_type];

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
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Board Type</FormLabel>
									<Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="TASK_MANAGEMENT">Task Management</SelectItem>
											<SelectItem value="HABIT_TRACKER">Habit Tracker</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>

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

						<Fields disabled={isPending} />

						<div className="flex flex-col gap-[12]">
							<Button
								type="submit"
								className="w-full"
								disabled={isPending}
							>
								{isPending ? "Creating board..." : BOARD_SUBMIT_LABELS[selected_type]}
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
