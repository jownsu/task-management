"use client";

/* REACT */
import { useEffect } from "react";

/* NEXT */
import { useParams } from "next/navigation";

/* COMPONENTS */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ColorPicker from "@/components/ui/color-picker";

/* PLUGINS */
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

/* SCHEMA */
import { MAX_BOARD_TAGS } from "@/schema/tag-schema";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* MUTATIONS */
import { useEditBoard } from "@/hooks/mutations/board.mutation";

/* ICONS */
import { FaPlus } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";

/* CONSTANTS */
import { DEFAULT_COLUMN_THEME } from "@/constants";

const edit_tags_form_schema = z.object({
	tags: z.array(z.object({
		id: z.string().optional(),
		name: z.string().min(1, "Can't be empty"),
		color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").default("#635FC7"),
		is_new: z.boolean().default(false).optional()
	})).max(MAX_BOARD_TAGS, `You can only have up to ${MAX_BOARD_TAGS} tags`)
});

type EditTagsFormSchema = z.infer<typeof edit_tags_form_schema>;

/**
 * DOCU: Modal for managing board tags (add, edit, delete). <br>
 * Triggered: When the user clicks "Edit Tags" from the board dropdown menu. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
const EditTagsModal = () => {
	const { board_id } = useParams() as { board_id: string };
	const board_modals = useBoardStore((state) => state.modals);
	const setModal = useBoardStore((state) => state.setModal);
	const selected_board = useBoardStore((state) => state.selected_board);
	const { board } = useGetBoard(board_id);

	const form = useForm<EditTagsFormSchema>({
		resolver: zodResolver(edit_tags_form_schema),
		defaultValues: { tags: [] }
	});

	const errors = form.formState.errors;

	const {
		fields: tags,
		append,
		remove
	} = useFieldArray({
		control: form.control,
		name: "tags",
		keyName: "temp_id"
	});

	const { editBoard, isPending } = useEditBoard({
		onSuccess: () => setModal("edit_tags", false)
	});

	/**
	 * DOCU: Submits the tag changes by sending the full board data with updated tags. <br>
	 * Triggered: On clicking "Save Changes" in the edit tags modal. <br>
	 * Last Updated: April 09, 2026
	 * @author Jhones
	 */
	const onSubmit: SubmitHandler<EditTagsFormSchema> = (data) => {
		if (!selected_board) return;

		editBoard({
			id: selected_board.id,
			name: selected_board.name,
			columns: selected_board.columns?.map((column) => ({
				id: column.id,
				name: column.name,
				theme: column.theme,
				is_new: false
			})) || [],
			tags: data.tags
		});
	};

	useEffect(() => {
		if (board_modals.edit_tags && board) {
			form.reset({
				tags: board.tags?.map((tag) => ({
					id: tag.id,
					name: tag.name,
					color: tag.color,
					is_new: false
				})) || []
			});
		}
	}, [form, board_modals.edit_tags, board]);

	return (
		<Dialog
			open={board_modals.edit_tags}
			onOpenChange={(value) => setModal("edit_tags", value)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-h-lg">Edit Tags</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						className="flex flex-col gap-[24]"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<FormItem>
							<FormLabel>Board Tags</FormLabel>
							<div className="flex flex-col gap-[12]">
								{tags.map((tag, index) => (
									<div key={tag.temp_id} className="flex items-center gap-[8]">
										<Controller
											control={form.control}
											name={`tags.${index}.color`}
											render={({ field: color_field }) => (
												<ColorPicker
													value={color_field.value || DEFAULT_COLUMN_THEME}
													onChange={color_field.onChange}
													disabled={isPending}
													className="mx-[8]"
												/>
											)}
										/>
										<FormField
											control={form.control}
											name={`tags.${index}.name`}
											render={({ field }) => (
												<Input
													{...field}
													type="text"
													placeholder="e.g. Urgent"
													error={errors.tags?.[index]?.name?.message}
													floating_error
												/>
											)}
										/>
										<button
											type="button"
											className="cursor-pointer t-[32] hover:text-destructive text-medium-grey duration-200 translate-x-2.5"
											onClick={() => remove(index)}
										>
											<IoIosClose />
										</button>
									</div>
								))}
							</div>

							{tags.length < MAX_BOARD_TAGS && (
								<Button
									type="button"
									variant="secondary"
									className="mt-[12]"
									onClick={() => append({ name: "", color: DEFAULT_COLUMN_THEME, is_new: true })}
									disabled={isPending}
								>
									<FaPlus /> Add New Tag
								</Button>
							)}
						</FormItem>

						<div className="flex flex-col gap-[12]">
							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending ? "Saving..." : "Save Changes"}
							</Button>
							<Button type="button" variant="secondary" className="w-full" disabled={isPending} onClick={() => setModal("edit_tags", false)}>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default EditTagsModal;
