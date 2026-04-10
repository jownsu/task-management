/* PLUGINS */
import { create } from "zustand";

/* TYPES */
import { Board } from "@/types";

interface Modals {
	add_board: boolean;
	edit_board: boolean;
	edit_tags: boolean;
	delete_board: boolean;
}

interface BoardStore {
	modals: Modals;
	selected_board: Board | null;
	setModal: (modal: keyof Modals, value: boolean) => void;
	setSelectedBoard: (board: Board | null) => void;
}

export const useBoardStore = create<BoardStore>()((set) => ({
	modals: {
		add_board: false,
		edit_board: false,
		edit_tags: false,
		delete_board: false
	},
	selected_board: null,
	setModal: (modal, value) =>
		set((state) => ({
			modals: {
				...state.modals,
				[modal]: value
			}
		})),
	setSelectedBoard: (selected_board) => set({ selected_board })
}));
