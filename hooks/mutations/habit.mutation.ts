/* PLUGINS */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/* ACTIONS */
import { addHabitAction, editHabitAction } from "@/actions/habit-tracker-board.actions";
import { toggleHabitLogAction } from "@/actions/habit-log.actions";

/* UTILITIES */
import { executeAction } from "@/lib/execute-action";

/* CONSTANTS */
import { CACHE_KEY_HABIT_TRACKER_BOARD, CACHE_KEY_HABIT_LOGS } from "@/constants/query-keys";

/* SCHEMA */
import { AddHabitSchema, EditHabitSchema, ToggleHabitLogSchema } from "@/schema/board-schema";

/* TYPES */
import { Board, CallbackResponse, Habit, HabitLog } from "@/types";

/**
 * DOCU: Creates a new habit on a board and appends it to the board's habit list in the cache. <br>
 * Triggered: On submission of the Add Habit modal. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const useAddHabit = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: addHabit, ...rest } = useMutation({
		mutationFn: (payload: AddHabitSchema) => executeAction(addHabitAction(payload)),
		onSuccess: (response) => {
			if (response) {
				const new_habit: Habit = { id: response.id, name: response.name, theme: response.theme, goal: response.goal };

				queryClient.setQueryData<Board>([...CACHE_KEY_HABIT_TRACKER_BOARD, response.board_id], (board) => {
					if (!board) return board;
					return {
						...board,
						habits: [...(board.habits ?? []), new_habit],
						habitOrder: [...board.habitOrder, response.id]
					};
				});

				toast.success("Habit added successfully.");
				callback?.onSuccess?.();
			}
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
			callback?.onError?.();
		}
	});

	return { addHabit, ...rest };
};

/**
 * DOCU: Updates a single habit's name, theme, and goal, and refreshes the board cache. <br>
 * Triggered: On submission of the Edit Habit modal. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const useEditHabit = (callback?: CallbackResponse) => {
	const queryClient = useQueryClient();

	const { mutate: editHabit, ...rest } = useMutation({
		mutationFn: (payload: EditHabitSchema) => executeAction(editHabitAction(payload)),
		onSuccess: (response) => {
			if (response) {
				queryClient.setQueryData<Board>([...CACHE_KEY_HABIT_TRACKER_BOARD, response.board_id], (board) => {
					if (!board) return board;
					return {
						...board,
						habits: (board.habits ?? []).map((habit) =>
							habit.id === response.id ? { id: response.id, name: response.name, theme: response.theme, goal: response.goal } : habit
						)
					};
				});

				toast.success("Habit updated successfully.");
				callback?.onSuccess?.();
			}
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
			callback?.onError?.();
		}
	});

	return { editHabit, ...rest };
};

/**
 * DOCU: Toggles a habit log on a given date with optimistic cache update + rollback on failure. <br>
 * Triggered: When the user clicks a day cell in the habit grid. <br>
 * Last Updated: April 25, 2026
 * @author Jhones
 */
export const useToggleHabitLog = (board_id: string, year: number, month_num: number) => {
	const queryClient = useQueryClient();
	const queryKey = [...CACHE_KEY_HABIT_LOGS, board_id, year, month_num];

	const { mutate: toggleHabitLog, ...rest } = useMutation({
		mutationFn: (payload: ToggleHabitLogSchema) => executeAction(toggleHabitLogAction(payload)),
		onMutate: async (payload) => {
			await queryClient.cancelQueries({ queryKey });
			const previous_logs = queryClient.getQueryData<HabitLog[]>(queryKey);

			queryClient.setQueryData<HabitLog[]>(queryKey, (logs) => {
				if (!logs) return logs;
				const exists = logs.some((log) => log.habitId === payload.habit_id && log.date === payload.date);
				if (exists) {
					return logs.filter((log) => !(log.habitId === payload.habit_id && log.date === payload.date));
				}
				return [...logs, { habitId: payload.habit_id, date: payload.date }];
			});

			return { previous_logs };
		},
		onError: (_, __, context) => {
			if (context?.previous_logs) {
				queryClient.setQueryData(queryKey, context.previous_logs);
			}
			toast.error("Failed to update habit. Please try again.");
		}
	});

	return { toggleHabitLog, ...rest };
};
