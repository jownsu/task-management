/* SCHEMA */
import { DeleteBoardSchemaType } from "@/schema/board-schema";

/* PLUGINS */
import { useMutation } from "@tanstack/react-query";

export const useDeleteBoard = () => {
	const { mutate: deleteBoard, ...rest } = useMutation({
		mutationFn: async (payload: DeleteBoardSchemaType) => payload
	});

	return { deleteBoard, ...rest };
};
