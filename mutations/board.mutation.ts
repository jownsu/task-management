/* SCHEMA */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";
import { BoardSchemaType } from "@/schema/board-schema";

/* ACTIONS */
import { createBoardAction } from "@/server/actions/board/create-board.action";

/* TYPES */
import { Board } from "@/types/board";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateBoard = () => {
	const queryClient = useQueryClient();

	const { mutate: createBoard, ...rest } = useMutation({
		mutationFn: (data: BoardSchemaType) => createBoardAction(data),
		onSuccess: (response) => {
            if(response?.data?.status){
                const new_board = response.data.data;

                queryClient.setQueryData<Board[]>(CACHE_KEY_BOARDS, (boards) => {
                    if(boards && new_board){
                        return [
                            ...boards,
                            new_board
                        ]
                    }

                    return boards;
                })
            }
        }
	});

	return { createBoard, ...rest };
};
