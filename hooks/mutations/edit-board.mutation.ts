/* SCHEMA */
import { BoardSchemaType } from "@/schema/board-schema";

/* PLUGINS */
import { useMutation } from "@tanstack/react-query";

export const useEditBoard = () => {
	const { mutate: editBoard, ...rest } = useMutation({
		mutationFn: async (payload: BoardSchemaType) => payload
	});

	return { editBoard, ...rest };
};
