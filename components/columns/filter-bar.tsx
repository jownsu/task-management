"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useEffect, useState } from "react";

/* COMPONENTS */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

/* HOOKS */
import { useFilterParams } from "@/hooks/use-filter-params";

/* QUERIES */
import { useGetTaskManagementBoard } from "@/hooks/queries/task-management-board.query";

/* ICONS */
import { MdSearch, MdFilterList, MdClose } from "react-icons/md";

/* UTILITIES */
import { cn } from "@/lib/utils";

/**
 * DOCU: Renders the filter bar with search input, completion filter, tag filter, and clear button. <br>
 * Triggered: When the board page renders above the column list. <br>
 * Last Updated: May 21, 2026
 * @author Jhones
 */
const FilterBar = () => {
	const { board_id } = useParams() as { board_id: string };
	const { board } = useGetTaskManagementBoard(board_id);

	const { search_query, selected_tag_ids, setSearchQuery, toggleTagFilter, clearFilters, is_filters_active } = useFilterParams();

	const [local_search, setLocalSearch] = useState(search_query);

	/**
	 * DOCU: Debounces the local search input and updates the URL search param after 300ms. <br>
	 * Triggered: When the local search input value changes. <br>
	 * Last Updated: May 21, 2026
	 * @author Jhones
	 */
	useEffect(() => {
		if (local_search === search_query) return;
		const timeout = setTimeout(() => {
			setSearchQuery(local_search);
		}, 300);

		return () => clearTimeout(timeout);
	}, [local_search, setSearchQuery, search_query]);

	/**
	 * DOCU: Syncs the local search input when the URL search param is cleared externally. <br>
	 * Triggered: When search_query resets to empty (e.g., via clearFilters). <br>
	 * Last Updated: May 21, 2026
	 * @author Jhones
	 */
	useEffect(() => {
		if (search_query === "") {
			setLocalSearch("");
		}
	}, [search_query, setLocalSearch]);

	return (
		<div className="flex flex-wrap items-center gap-[12] mb-[20]">
			{/* Search Input */}
			<div className="relative">
				<MdSearch className="absolute left-[12] top-1/2 -translate-y-1/2 size-[18] text-medium-grey z-10" />
				<Input
					value={local_search}
					onChange={(e) => setLocalSearch(e.target.value)}
					placeholder="Search tasks..."
					containerClassName="w-[220] bg-background"
					className="pl-[36]"
				/>
			</div>

			{/* Tag Filter */}
			{board?.tags && board.tags.length > 0 && (
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="secondary" size="default" className={cn("gap-[8]", selected_tag_ids.length > 0 && "ring-2 ring-primary/30")}>
							<MdFilterList className="size-[16]" />
							Tags
							{selected_tag_ids.length > 0 && (
								<span className="bg-primary text-white rounded-full size-[20] flex items-center justify-center t-[11]">
									{selected_tag_ids.length}
								</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-[220] p-[12] bg-foreground border border-lines shadow-lg">
						<p className="text-h-sm text-medium-grey mb-[12]">Filter by Tag</p>
						<div className="flex flex-col gap-[8] max-h-[200] overflow-y-auto">
							{board.tags.map((tag) => (
								<label key={tag.id} className="flex items-center gap-[10] cursor-pointer hover:bg-muted/50 rounded-md px-[8] py-[6]">
									<Checkbox
										checked={selected_tag_ids.includes(tag.id)}
										onCheckedChange={() => toggleTagFilter(tag.id)}
									/>
									<span className="size-[10] rounded-full shrink-0" style={{ backgroundColor: tag.color }}></span>
									<span className="text-b-lg truncate">{tag.name}</span>
								</label>
							))}
						</div>
					</PopoverContent>
				</Popover>
			)}

			{/* Clear Filters */}
			{is_filters_active && (
				<Button variant="ghost" size="sm" onClick={clearFilters} className="gap-[6] text-medium-grey hover:text-destructive">
					<MdClose className="size-[16]" />
					Clear Filters
				</Button>
			)}
		</div>
	);
};

export default FilterBar;
