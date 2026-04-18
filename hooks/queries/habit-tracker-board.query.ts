/* NEXT */
import { dehydrate, useQuery } from "@tanstack/react-query";

/* CONSTANTS */
import { CACHE_KEY_HABIT_TRACKER_BOARD } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants";

/* UTILITIES */
import getQueryClient from "@/lib/get-query-client";

/* ACTIONS */
import { getHabitTrackerBoardById } from "@/actions/habit-tracker-board.actions";

/* TYPES */
import type { Board } from "@/types";

/**
 * DOCU: Prefetches a habit-tracker board and returns both the dehydrated React Query state and the board snapshot. <br>
 * Triggered: On load of the habit-tracker board detail page. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export const prefetchHabitTrackerBoard = async (board_id: string) => {
	const queryClient = getQueryClient();

	await queryClient.prefetchQuery({
		queryKey: [...CACHE_KEY_HABIT_TRACKER_BOARD, board_id],
		queryFn: () => getHabitTrackerBoardById(board_id),
		staleTime: STALE_TIME
	});

	const board = queryClient.getQueryData<Board>([...CACHE_KEY_HABIT_TRACKER_BOARD, board_id]);

	return { dehydrated_state: dehydrate(queryClient), board };
};

/**
 * DOCU: Reads the currently selected habit-tracker board from the React Query cache. <br>
 * Triggered: From components rendered inside a habit-tracker board page. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
export const useGetHabitTrackerBoard = (board_id?: string) => {
	const { data: board, ...rest } = useQuery({
		queryKey: [...CACHE_KEY_HABIT_TRACKER_BOARD, board_id],
		queryFn: () => getHabitTrackerBoardById(board_id!),
		staleTime: STALE_TIME,
		enabled: !!board_id
	});

	return { board, ...rest };
};
