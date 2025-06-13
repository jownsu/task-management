/* SCHEMA */
import { BoardSchemaType } from "@/schema/board-schema";

/* PLUGINS */
import { useMutation } from "@tanstack/react-query";

export const useCreateBoard = () => {
	const { mutate: createBoard, ...rest } = useMutation({
		mutationFn: async (payload: BoardSchemaType) => payload
	});

	return { createBoard, ...rest };
};
