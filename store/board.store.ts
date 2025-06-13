/* PLUGINS */
import { create } from "zustand";

/* TYPES */
import { Board } from "@/types";

interface Modals {
	add_board: boolean;
	edit_board: boolean;
	delete_board: boolean;
}

interface BoardStore {
	modals: Modals;
	selected_board: Board | null;
	setModal: (modal: keyof Modals, value: boolean) => void;
}

export const useBoardStore = create<BoardStore>()((set) => ({
	modals: {
		add_board: false,
		edit_board: false,
		delete_board: false
	},
	selected_board: null,
	setModal: (modal, value) =>
		set((state) => ({
			modals: {
				...state.modals,
				[modal]: value
			}
		}))
}));
