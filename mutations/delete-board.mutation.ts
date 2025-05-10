/* SCHEMA */
import { CACHE_KEY_BOARDS } from "@/constants/query-keys";
import { DeleteBoardSchemaType } from "@/schema/board-schema";

/* ACTIONS */
import { deleteBoardAction } from "@/server/actions/board/delete-board.action";
import { useBoardStore } from "@/store/board.store";

/* TYPES */
import { Board } from "@/constants/types";

/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useDeleteBoard = () => {
	const queryClient = useQueryClient();
    const setModal = useBoardStore((state) => state.setModal);
    const router = useRouter();

	const { mutate: deleteBoard, ...rest } = useMutation({
		mutationFn: (payload: DeleteBoardSchemaType) => deleteBoardAction(payload),
		onSuccess: (response, payload) => {
            if(response?.data?.status){
                queryClient.setQueryData<Board[]>(CACHE_KEY_BOARDS, (boards) => {
                    if(boards){
                        return boards.filter(board => board.id !== payload.id)
                    }

                    return boards;
                })

                const first_board = queryClient.getQueryData<Board[]>(CACHE_KEY_BOARDS)?.[0] || null;

                setModal("delete_board", false);
                router.push(`/${first_board?.id}`);
            }
        }
	});

	return { deleteBoard, ...rest };
};
