/* SCHEMA */
import { DeleteBoardSchemaType } from "@/schema/board-schema";

/* PLUGINS */
import { useMutation } from "@tanstack/react-query";

/**
 * DOCU: Will delete the selected board. <br>
 * Triggered: On submission of delete board form. <br>
 */
export const useDeleteBoard = () => {
	const { mutate: deleteBoard, ...rest } = useMutation({
		mutationFn: async (payload: DeleteBoardSchemaType) => payload
	});

	return { deleteBoard, ...rest };
};
