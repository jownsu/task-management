/* SCHEMA */
import { DeleteColumnSchemaType } from "@/schema/column-schema";

/* TYPES */
import { CallbackResponse } from "@/types";

/* PLUGINS */
import { useMutation } from "@tanstack/react-query";

export const useDeleteColumn = (callback?: CallbackResponse) => {
	const { mutate: deleteColumn, ...rest } = useMutation({
		mutationFn: async (payload: DeleteColumnSchemaType) => payload,
		onSuccess: () => callback?.onSuccess?.()
	});

	return { deleteColumn, ...rest };
};
