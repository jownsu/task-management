/* PLUGINS */
import { create } from "zustand";

/* TYPES */
import { Column } from "@/constants/types";

interface Modals {
	delete_column: boolean;
}

interface ColumnStore {
	modals: Modals;
	selected_column: Column | null;
	setModal: (modal: keyof Modals, value: boolean) => void;
	setSelectedColumn: (column?: Column | null) => void
}

export const useColumnStore = create<ColumnStore>()((set) => ({
	modals: {
		delete_column: false
	},
	selected_column: null,
	setModal: (modal, value) =>
		set((state) => ({
			modals: {
				...state.modals,
				[modal]: value
			}
		})),
	setSelectedColumn: (selected_column) =>
		set((state) => ({
			selected_column: selected_column ? selected_column : state.selected_column
		}))
}));
