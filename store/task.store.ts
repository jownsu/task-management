/* PLUGINS */
import { create } from "zustand";

/* TYPES */
import { Task } from "@/types";

interface Modals {
	add_task: boolean;
	edit_task: boolean;
}

interface TaskStore {
	modals: Modals;
	selected_task: Task | null;
	setModal: (modal: keyof Modals, value: boolean) => void;
}

export const useTaskStore = create<TaskStore>()((set) => ({
	modals: {
		add_task: false,
		edit_task: false,
	},
	selected_task: null,
	setModal: (modal, value) =>
		set((state) => ({
			modals: {
				...state.modals,
				[modal]: value
			}
		}))
}));
