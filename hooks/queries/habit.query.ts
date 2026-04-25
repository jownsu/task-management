/* PLUGINS */
import { useQuery } from "@tanstack/react-query";

/* ACTIONS */
import { getHabitLogsForBoard } from "@/actions/habit-log.actions";

/* CONSTANTS */
import { CACHE_KEY_HABIT_LOGS } from "@/constants/query-keys";
import { STALE_TIME } from "@/constants";

/**
 * DOCU: Reads all habit logs for the current board and visible month. <br>
 * Triggered: From the habit-tracker board orchestrator on render and month change. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const useGetHabitLogs = (board_id?: string, year?: number, month_num?: number) => {
	const { data: logs, ...rest } = useQuery({
		queryKey: [...CACHE_KEY_HABIT_LOGS, board_id, year, month_num],
		queryFn: () => getHabitLogsForBoard(board_id!, year!, month_num!),
		staleTime: STALE_TIME,
		enabled: !!board_id && !!year && !!month_num
	});

	return { logs: logs ?? [], ...rest };
};
