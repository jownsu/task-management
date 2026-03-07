/* PLUGINS */
import { create } from "zustand";

interface Modals {
	add_task: boolean;
	edit_task: boolean;
	view_task: boolean;
	delete_task: boolean;
}

interface TaskStore {
	modals: Modals;
	selected_task_id: string | null;
	selected_column_id: string | null;
	setModal: (modal: keyof Modals, value: boolean) => void;
	setSelectedTask: (task_id: string, column_id: string) => void;
}

export const useTaskStore = create<TaskStore>()((set) => ({
	modals: {
		add_task: false,
		edit_task: false,
		view_task: false,
		delete_task: false
	},
	selected_task_id: null,
	selected_column_id: null,
	setModal: (modal, value) =>
		set((state) => ({
			modals: {
				...state.modals,
				[modal]: value
			}
		})),
	setSelectedTask: (selected_task_id, selected_column_id) => set({ selected_task_id, selected_column_id })
}));
