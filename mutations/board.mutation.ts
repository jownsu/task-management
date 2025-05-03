
/* SCHEMA */
import { BoardSchemaType } from "@/schema/board-schema";

/* ACTIONS */
import { createBoardAction } from "@/server/actions/board/create-board.action";

/* PLUGINS */
import { useMutation } from "@tanstack/react-query";

export const useCreateBoard = () => {
    const {mutate: createBoard, ...rest} = useMutation({
        mutationFn: (data: BoardSchemaType) => createBoardAction(data)
    });

    return { createBoard, ...rest}
}