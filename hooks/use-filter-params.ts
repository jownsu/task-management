"use client";

/* REACT */
import { useCallback } from "react";

/* PLUGINS */
import { parseAsArrayOf, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

/* TYPES */
export type CompletionFilter = "all" | "completed" | "not_completed";

/* CONSTANTS */
const COMPLETION_FILTERS = ["all", "completed", "not_completed"] as const;

const filter_parsers = {
	q: parseAsString.withDefault(""),
	status: parseAsStringLiteral(COMPLETION_FILTERS).withDefault("all"),
	tags: parseAsArrayOf(parseAsString).withDefault([]),
};

/**
 * DOCU: Provides URL-based filter state via nuqs — persists search query, completion filter, and tag filter across page refreshes. <br>
 * Triggered: In FilterBar, useFilteredTasks, and TaskItem. <br>
 * Last Updated: May 21, 2026
 * @author Jhones
 */
export const useFilterParams = () => {
	const [{ q, status, tags }, setFilters] = useQueryStates(filter_parsers, { shallow: true });

	/**
	 * DOCU: Updates the search query param. Clears param from URL when query is empty. <br>
	 * Triggered: When the debounced search input value changes. <br>
	 * Last Updated: May 21, 2026
	 * @author Jhones
	 */
	const setSearchQuery = useCallback((query: string) => setFilters({ q: query || null }), [setFilters]);

	/**
	 * DOCU: Sets the completion status filter param. Removes param from URL when set to default "all". <br>
	 * Triggered: When the user selects a completion filter option. <br>
	 * Last Updated: May 21, 2026
	 * @author Jhones
	 */
	const setCompletionFilter = useCallback(
		(filter: CompletionFilter) => setFilters({ status: filter === "all" ? null : filter }),
		[setFilters]
	);

	/**
	 * DOCU: Toggles a tag in the tags param — adds if not present, removes if present. Clears param when no tags remain. <br>
	 * Triggered: When the user checks or unchecks a tag in the tag filter popover. <br>
	 * Last Updated: May 21, 2026
	 * @author Jhones
	 */
	const toggleTagFilter = useCallback(
		(tag_id: string) =>
			setFilters((prev) => {
				const new_tags = prev.tags.includes(tag_id) ? prev.tags.filter((id) => id !== tag_id) : [...prev.tags, tag_id];
				return { tags: new_tags.length === 0 ? null : new_tags };
			}),
		[setFilters]
	);

	/**
	 * DOCU: Resets all filter params to defaults by removing them from the URL. <br>
	 * Triggered: When the user clicks the clear filters button. <br>
	 * Last Updated: May 21, 2026
	 * @author Jhones
	 */
	const clearFilters = useCallback(() => setFilters({ q: null, status: null, tags: null }), [setFilters]);

	return {
		search_query: q,
		completion_filter: status,
		selected_tag_ids: tags,
		setSearchQuery,
		setCompletionFilter,
		toggleTagFilter,
		clearFilters,
		is_filters_active: q !== "" || status !== "all" || tags.length > 0,
	};
};
