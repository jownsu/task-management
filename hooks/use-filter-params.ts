"use client";

/* REACT */
import { useCallback } from "react";

/* PLUGINS */
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";

/* CONSTANTS */
const filter_parsers = {
	q: parseAsString.withDefault(""),
	tags: parseAsArrayOf(parseAsString).withDefault([]),
	expanded: parseAsArrayOf(parseAsString).withDefault([]),
};

/**
 * DOCU: Provides URL-based filter and view state via nuqs — persists search query, tag filter, and expanded completed-section columns across refreshes. <br>
 * Triggered: In FilterBar, useFilteredTasks, TaskItem, and CompletedSection. <br>
 * Last Updated: June 13, 2026
 * @author Jhones
 */
export const useFilterParams = () => {
	const [{ q, tags, expanded }, setFilters] = useQueryStates(filter_parsers, { shallow: true });

	/**
	 * DOCU: Updates the search query param. Clears param from URL when query is empty. <br>
	 * Triggered: When the debounced search input value changes. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const setSearchQuery = useCallback((query: string) => setFilters({ q: query || null }), [setFilters]);

	/**
	 * DOCU: Toggles a tag in the tags param — adds if not present, removes if present. Clears param when no tags remain. <br>
	 * Triggered: When the user checks or unchecks a tag in the tag filter popover. <br>
	 * Last Updated: June 13, 2026
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
	 * DOCU: Toggles a column's completed-section expanded state — adds if collapsed, removes if expanded. Clears param when none remain. <br>
	 * Triggered: When the user clicks a column's "N completed" disclosure row. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const toggleColumnExpanded = useCallback(
		(column_id: string) =>
			setFilters((prev) => {
				const new_expanded = prev.expanded.includes(column_id) ? prev.expanded.filter((id) => id !== column_id) : [...prev.expanded, column_id];
				return { expanded: new_expanded.length === 0 ? null : new_expanded };
			}),
		[setFilters]
	);

	/**
	 * DOCU: Resets search and tag filters to defaults by removing them from the URL. Does not affect expanded view state. <br>
	 * Triggered: When the user clicks the clear filters button. <br>
	 * Last Updated: June 13, 2026
	 * @author Jhones
	 */
	const clearFilters = useCallback(() => setFilters({ q: null, tags: null }), [setFilters]);

	return {
		search_query: q,
		selected_tag_ids: tags,
		expanded_column_ids: expanded,
		setSearchQuery,
		toggleTagFilter,
		toggleColumnExpanded,
		clearFilters,
		is_filters_active: q !== "" || tags.length > 0,
	};
};
