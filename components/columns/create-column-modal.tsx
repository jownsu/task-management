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

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

/* SCHEMA */
import { AddColumnSchema, add_column_schema } from "@/schema/column-schema";

/* STORE */
import { useColumnStore } from "@/store/column.store";

/* MUTATIONS */
import { useCreateColumn } from "@/hooks/mutations/column.mutation";

const CreateColumnModal = () => {
	const { board_id } = useParams() as { board_id: string };
	const setModal = useColumnStore((state) => state.setModal);
	const modals = useColumnStore((state) => state.modals);

	const form = useForm<AddColumnSchema>({
		resolver: zodResolver(add_column_schema),
		defaultValues: {
			board_id: "",
			name: ""
		}
	});

	const errors = form.formState.errors;

	const { createColumn, isPending } = useCreateColumn({
		onSuccess: () => {
			setModal("add_column", false);
		}
	});

	/**
	 * DOCU: Handles form submission for creating a new column. <br>
	 * Triggered: On submission of add column form. <br>
	 * Last Updated: March 11, 2026
	 * @author Jhones
	 */
	const onCreateColumnSubmit: SubmitHandler<AddColumnSchema> = (data) => {
		createColumn(data);
	};

	useEffect(() => {
		if (modals.add_column) {
			form.reset({ board_id, name: "" });
		}
	}, [modals.add_column, form, board_id]);

	return (
		<Dialog
			open={modals.add_column}
			onOpenChange={(value) => setModal("add_column", value)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg">Add New Column</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						className="flex flex-col gap-[24]"
						onSubmit={form.handleSubmit(onCreateColumnSubmit)}
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Column Name</FormLabel>
									<Input
										{...field}
										type="text"
										placeholder="e.g. Todo"
										error={errors.name?.message}
									/>
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="w-full"
							disabled={isPending}
						>
							{isPending ? "Creating column..." : "Create New Column"}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateColumnModal;
