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
	add_task_column_id: string | null;
	add_task_initial_title: string;
	setModal: (modal: keyof Modals, value: boolean) => void;
	setSelectedTask: (task_id: string, column_id: string) => void;
	openAddTask: (column_id: string, initial_title: string) => void;
	resetAddTask: () => void;
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
	add_task_column_id: null,
	add_task_initial_title: "",
	setModal: (modal, value) =>
		set((state) => ({
			modals: {
				...state.modals,
				[modal]: value
			}
		})),
	setSelectedTask: (selected_task_id, selected_column_id) => set({ selected_task_id, selected_column_id }),
	/**
	 * DOCU: Opens the add-task modal pre-scoped to a column, carrying an initial title. <br>
	 * Triggered: From a column quick-add's expand button. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	openAddTask: (add_task_column_id, add_task_initial_title) =>
		set((state) => ({
			add_task_column_id,
			add_task_initial_title,
			modals: { ...state.modals, add_task: true }
		})),
	/**
	 * DOCU: Clears the add-task pre-fill fields. <br>
	 * Triggered: After the add-task modal closes, to clear the pre-fill (does not close the modal itself). <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	resetAddTask: () => set({ add_task_column_id: null, add_task_initial_title: "" })
}));
