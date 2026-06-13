"use client";

/* COMPONENTS */
import TaskItem from "@/components/columns/task-item";

/* HOOKS */
import { useFilterParams } from "@/hooks/use-filter-params";

/* TYPES */
import { Task } from "@/types";

/* UTILITIES */
import { cn } from "@/lib/utils";

/* ICONS */
import { MdCheckCircle, MdExpandMore } from "react-icons/md";

interface Props {
	column_id: string;
	completed_tasks: Task[];
	index_offset: number;
}

/**
 * DOCU: Renders a collapsible "N completed" disclosure for a column's completed tasks. Collapsed by default; auto-expands while a search query is active so matches stay visible. <br>
 * Triggered: At the bottom of each ColumnItem when the column has at least one completed task. <br>
 * Last Updated: June 13, 2026
 * @author Jhones
 */
const CompletedSection = ({ column_id, completed_tasks, index_offset }: Props) => {
	const { expanded_column_ids, toggleColumnExpanded, search_query } = useFilterParams();

	if (completed_tasks.length === 0) return null;

	/* Search forces expansion (completed_tasks here are already search-filtered) without mutating the URL param. */
	const is_expanded = expanded_column_ids.includes(column_id) || search_query !== "";

	return (
		<div className="flex flex-col gap-[20]">
			<button
				type="button"
				onClick={search_query ? undefined : () => toggleColumnExpanded(column_id)}
				className={cn(
					"flex items-center gap-[8] text-h-sm text-medium-grey uppercase transition-colors",
					!search_query && "cursor-pointer hover:text-success"
				)}
				aria-expanded={is_expanded}
				aria-disabled={!!search_query}
			>
				<MdCheckCircle className="size-[16] text-success" />
				<span>{completed_tasks.length} completed</span>
				<MdExpandMore className={cn("size-[18] transition-transform", is_expanded && "rotate-180")} />
			</button>

			{is_expanded &&
				completed_tasks.map((task, index) => (
					<TaskItem
						key={task.id}
						task={task}
						column_id={column_id}
						index={index_offset + index}
						is_completed_section
					/>
				))}
		</div>
	);
};

export default CompletedSection;
