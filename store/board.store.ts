/* PLUGINS */
import { create } from "zustand";

/* TYPES */
import { Board, Habit } from "@/types";

interface Modals {
	add_board: boolean;
	edit_board: boolean;
	edit_tags: boolean;
	delete_board: boolean;
	add_habit: boolean;
	edit_habit: boolean;
}

interface BoardStore {
	modals: Modals;
	selected_board: Board | null;
	selected_habit: Habit | null;
	setModal: (modal: keyof Modals, value: boolean) => void;
	setSelectedBoard: (board: Board | null) => void;
	setSelectedHabit: (habit: Habit | null) => void;
}

export const useBoardStore = create<BoardStore>()((set) => ({
	modals: {
		add_board: false,
		edit_board: false,
		edit_tags: false,
		delete_board: false,
		add_habit: false,
		edit_habit: false
	},
	selected_board: null,
	selected_habit: null,
	setModal: (modal, value) =>
		set((state) => ({
			modals: {
				...state.modals,
				[modal]: value
			}
		})),
	setSelectedBoard: (selected_board) => set({ selected_board }),
	setSelectedHabit: (selected_habit) => set({ selected_habit })
}));
