/* PLUGINS */
import { create } from "zustand";

/* TYPES */
import { Column } from "@/types";

interface Modals {
	add_column: boolean;
}

interface ColumnStore {
	modals: Modals;
	selected_column: Column | null;
	callback: (() => void) | null;
	setModal: (modal: keyof Modals, value: boolean) => void;
	setSelectedColumn: (column?: Column | null, callback?: () => void) => void
}

export const useColumnStore = create<ColumnStore>()((set) => ({
	modals: {
		add_column: false
	},
	selected_column: null,
	callback: null,
	setModal: (modal, value) =>
		set((state) => ({
			modals: {
				...state.modals,
				[modal]: value
			}
		})),
	setSelectedColumn: (selected_column, callback) =>
		set((state) => ({
			selected_column: selected_column ? selected_column : state.selected_column,
			callback
		}))
}));
