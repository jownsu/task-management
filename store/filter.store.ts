/* PLUGINS */
import { create } from "zustand";

type CompletionFilter = "all" | "completed" | "not_completed";

interface FilterStore {
	search_query: string;
	completion_filter: CompletionFilter;
	selected_tag_ids: string[];
	setSearchQuery: (query: string) => void;
	setCompletionFilter: (filter: CompletionFilter) => void;
	toggleTagFilter: (tag_id: string) => void;
	clearFilters: () => void;
}

/**
 * DOCU: Zustand store for managing task filter state across the board page. <br>
 * Triggered: When users interact with the filter bar controls. <br>
 * Last Updated: April 10, 2026
 * @author Jhones
 */
export const useFilterStore = create<FilterStore>()((set) => ({
	search_query: "",
	completion_filter: "all" as CompletionFilter,
	selected_tag_ids: [],

	/**
	 * DOCU: Updates the search query for filtering tasks by title. <br>
	 * Triggered: When the debounced search input value changes. <br>
	 * Last Updated: April 10, 2026
	 * @author Jhones
	 */
	setSearchQuery: (search_query) => set({ search_query }),

	/**
	 * DOCU: Sets the completion status filter for tasks. <br>
	 * Triggered: When the user selects a completion filter option from the dropdown. <br>
	 * Last Updated: April 10, 2026
	 * @author Jhones
	 */
	setCompletionFilter: (completion_filter) => set({ completion_filter }),

	/**
	 * DOCU: Toggles a tag in the selected tags filter — adds if not present, removes if present. <br>
	 * Triggered: When the user checks or unchecks a tag in the tag filter popover. <br>
	 * Last Updated: April 10, 2026
	 * @author Jhones
	 */
	toggleTagFilter: (tag_id) =>
		set((state) => ({
			selected_tag_ids: state.selected_tag_ids.includes(tag_id) ? state.selected_tag_ids.filter((id) => id !== tag_id) : [...state.selected_tag_ids, tag_id],
		})),

	/**
	 * DOCU: Resets all filter values to their defaults. <br>
	 * Triggered: When the user clicks the clear filters button. <br>
	 * Last Updated: April 10, 2026
	 * @author Jhones
	 */
	clearFilters: () =>
		set({
			search_query: "",
			completion_filter: "all",
			selected_tag_ids: [],
		}),
}));
