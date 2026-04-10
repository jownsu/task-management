/* ACTIONS */
import { createTagAction, deleteTagAction, editTagAction } from "@/actions/tag.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* SCHEMA */
import { CreateTagSchemaType, DeleteTagSchemaType, EditTagSchemaType } from "@/schema/tag-schema";

/* TYPES */
import { Board, CallbackResponse, Tag } from "@/types";

/* CONSTANTS */
import { CACHE_KEY_BOARD } from "@/constants/query-keys";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * DOCU: Will create a new tag on a board. <br>
 * Triggered: On clicking "Add New Tag" in the edit board modal. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export const useCreateTag = (callback?: CallbackResponse<Tag>) => {
	const queryClient = useQueryClient();

	const { mutate: createTag, ...rest } = useMutation({
		mutationFn: (payload: CreateTagSchemaType) => executeAction(createTagAction(payload)),
		onSuccess: (response, payload) => {
			if (response) {
				queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
					if (!board) return board;

					return {
						...board,
						tags: [...(board.tags || []), response]
					};
				});
			}

			toast.success("Tag created successfully.");
			callback?.onSuccess?.(response);
		},
		onError: (error) => {
			toast.error(error.message || "Something went wrong. Please try again.");
		}
	});

	return { createTag, ...rest };
};

/**
 * DOCU: Will edit an existing tag on a board. <br>
 * Triggered: On editing a tag's name or color in the edit board modal. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export const useEditTag = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: editTag, ...rest } = useMutation({
		mutationFn: (payload: EditTagSchemaType) => executeAction(editTagAction(payload)),
		onSuccess: (response, payload) => {
			if (response) {
				queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
					if (!board) return board;

					return {
						...board,
						tags: board.tags?.map((tag) =>
							tag.id === payload.tag_id ? response : tag
						),
						columns: board.columns?.map((column) => ({
							...column,
							tasks: column.tasks?.map((task) => ({
								...task,
								tags: task.tags.map((tag) =>
									tag.id === payload.tag_id ? response : tag
								)
							}))
						}))
					};
				});
			}

			toast.success("Tag updated successfully.");
			callback?.onSuccess?.();
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		}
	});

	return { editTag, ...rest };
};

/**
 * DOCU: Will delete a tag from a board and remove it from all tasks. <br>
 * Triggered: On clicking the delete button for a tag in the edit board modal. <br>
 * Last Updated: April 09, 2026
 * @author Jhones
 */
export const useDeleteTag = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: deleteTag, ...rest } = useMutation({
		mutationFn: (payload: DeleteTagSchemaType) => executeAction(deleteTagAction(payload)),
		onSuccess: (_, payload) => {
			queryClient.setQueryData<Board>([...CACHE_KEY_BOARD, payload.board_id], (board) => {
				if (!board) return board;

				return {
					...board,
					tags: board.tags?.filter((tag) => tag.id !== payload.tag_id),
					columns: board.columns?.map((column) => ({
						...column,
						tasks: column.tasks?.map((task) => ({
							...task,
							tags: task.tags.filter((tag) => tag.id !== payload.tag_id)
						}))
					}))
				};
			});

			toast.success("Tag deleted successfully.");
			callback?.onSuccess?.();
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		}
	});

	return { deleteTag, ...rest };
};
