/* SCHEMA */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";
import { BoardSchemaType } from "@/schema/board-schema";

/* ACTIONS */
import { editBoardAction } from "@/server/actions/board/edit-board.action";

/* STORE */
import { useBoardStore } from "@/store/board.store";

/* TYPES */
import { Board } from "@/constants/types";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEditBoard = () => {
	const queryClient = useQueryClient();
    const setModal = useBoardStore((state) => state.setModal);

	const { mutate: editBoard, ...rest } = useMutation({
		mutationFn: (payload: BoardSchemaType) => editBoardAction(payload),
		onSuccess: (response) => {
            if(response?.data?.status){
                const updated_board = response.data.data;

                queryClient.setQueryData<Board[]>(CACHE_KEY_BOARDS, (boards) => {
                    if(boards && updated_board){
                        return boards.map(board => {
                            if(board.id === updated_board.id){
                                return {
                                    ...board,
                                    title: updated_board.title,
                                    columns: updated_board.columns
                                }
                            }

                            return board;
                        })
                    }

                    return boards;
                });

        		setModal("edit_board", false);
            }
        }
	});

	return { editBoard, ...rest };
};
