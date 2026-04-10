/* REACT */
import { useMemo } from "react";

/* STORE */
import { useFilterStore } from "@/store/filter.store";

/* TYPES */
import { Task } from "@/types";

/**
 * DOCU: Filters an array of tasks based on the current filter store state (search, completion, tags). <br>
 * Triggered: When column items render their task lists. <br>
 * Last Updated: April 10, 2026
 * @author Jhones
 */
export const useFilteredTasks = (tasks: Task[]): Task[] => {
	const search_query = useFilterStore((state) => state.search_query);
	const completion_filter = useFilterStore((state) => state.completion_filter);
	const selected_tag_ids = useFilterStore((state) => state.selected_tag_ids);

	return useMemo(() => {
		let filtered = tasks;

		/* Filter by completion status */
		if (completion_filter === "completed") {
			filtered = filtered.filter((task) => task.isCompleted);
		} else if (completion_filter === "not_completed") {
			filtered = filtered.filter((task) => !task.isCompleted);
		}

		/* Filter by search query (case-insensitive title match) */
		if (search_query) {
			const query = search_query.toLowerCase();
			filtered = filtered.filter((task) => task.title.toLowerCase().includes(query));
		}

		/* Filter by tags (OR logic — task must have ANY of the selected tags) */
		if (selected_tag_ids.length > 0) {
			filtered = filtered.filter((task) => task.tags.some((tag) => selected_tag_ids.includes(tag.id)));
		}

		return filtered;
	}, [tasks, search_query, completion_filter, selected_tag_ids]);
};
