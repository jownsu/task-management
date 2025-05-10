/* SCHEMA */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";
import { BoardSchemaType } from "@/schema/board-schema";

/* ACTIONS */
import { createBoardAction } from "@/server/actions/board/create-board.action";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* TYPES */
import { Board } from "@/constants/types";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateBoard = () => {
	const queryClient = useQueryClient();
    const setModal = useBoardStore((state) => state.setModal);

	const { mutate: createBoard, ...rest } = useMutation({
		mutationFn: (payload: BoardSchemaType) => createBoardAction(payload),
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
                });

        		setModal("add_board", false);
            }
        }
	});

	return { createBoard, ...rest };
};
