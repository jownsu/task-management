/* PLUGINS */
import { create } from "zustand";

/* TYPES */
import { Column } from "@/types";

interface ColumnStore {
	selected_column: Column | null;
	callback: (() => void) | null;
	setSelectedColumn: (column?: Column | null, callback?: () => void) => void
}

export const useColumnStore = create<ColumnStore>()((set) => ({
	selected_column: null,
	callback: null,
	setSelectedColumn: (selected_column, callback) =>
		set((state) => ({
			selected_column: selected_column ? selected_column : state.selected_column,
			callback
		}))
}));
