/* NEXT */
import { dehydrate, useQuery } from "@tanstack/react-query";

/* CONSTANTS */
import { CACHE_KEY_TASK_MANAGEMENT_BOARD } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants";

/* UTILITIES */
import getQueryClient from "@/lib/get-query-client";

/* ACTIONS */
import { getTaskManagementBoardById } from "@/actions/task-management-board.actions";

/* TYPES */
import type { Board } from "@/types";

/**
 * DOCU: Prefetches a task-management board and returns both the dehydrated React Query state and the board snapshot. <br>
 * Triggered: On load of the task-management board detail page. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export const prefetchTaskManagementBoard = async (board_id: string) => {
	const queryClient = getQueryClient();

	await queryClient.prefetchQuery({
		queryKey: [...CACHE_KEY_TASK_MANAGEMENT_BOARD, board_id],
		queryFn: () => getTaskManagementBoardById(board_id),
		staleTime: STALE_TIME
	});

	const board = queryClient.getQueryData<Board>([...CACHE_KEY_TASK_MANAGEMENT_BOARD, board_id]);

	return { dehydrated_state: dehydrate(queryClient), board };
};

/**
 * DOCU: Reads the currently selected task-management board from the React Query cache. <br>
 * Triggered: From components rendered inside a task-management board page. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export const useGetTaskManagementBoard = (board_id?: string) => {
	const { data: board, ...rest } = useQuery({
		queryKey: [...CACHE_KEY_TASK_MANAGEMENT_BOARD, board_id],
		queryFn: () => getTaskManagementBoardById(board_id!),
		staleTime: STALE_TIME,
		enabled: !!board_id
	});

	return { board, ...rest };
};
