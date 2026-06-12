"use client";

/* NEXT */
import Link from "next/link";

/* REACT */
import { useRef, useState } from "react";

/* PLUGINS */
import { useSortable } from "@dnd-kit/react/sortable";

/* ICONS */
import IconBoardLink from "@/public/icon-board-link.svg";
import { MdDragIndicator } from "react-icons/md";
import { FaRegCalendarCheck } from "react-icons/fa6";

/* SCHEMA */
import { BoardType } from "@/schema/board-schema";

/* UTILITIES */
import { cn } from "@/lib/utils";

export const BOARD_ICONS: Record<BoardType, React.ComponentType<{ className?: string }>> = {
	TASK_MANAGEMENT: IconBoardLink,
	HABIT_TRACKER: FaRegCalendarCheck
};

export const BOARD_ROUTES: Record<BoardType, string> = {
	TASK_MANAGEMENT: "/tasks",
	HABIT_TRACKER: "/habits"
};

interface Props {
	board: { id: string; name: string; type: BoardType };
	index: number;
	is_active: boolean;
	disabled?: boolean;
}

/**
 * DOCU: Wraps a board link with drag-and-drop sortable functionality and a drag handle. Renders a type-specific icon via BOARD_ICONS. <br>
 * Triggered: When rendering board links in the sidebar boards list. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
const SortableBoardLink = ({ board, index, is_active, disabled }: Props) => {
	const [element, setElement] = useState<Element | null>(null);
	const handle_ref = useRef<HTMLButtonElement | null>(null);

	const { isDragging } = useSortable({
		id: board.id,
		index,
		element,
		handle: handle_ref,
		type: "board-link",
		accept: "board-link",
		group: "boards",
		disabled
	});

	const Icon = BOARD_ICONS[board.type];

	return (
		<div
			ref={setElement}
			className={cn(
				"flex items-center h-[48] pl-[16] rounded-r-full text-medium-grey !text-h-md group",
				!isDragging && is_active && "bg-primary text-white",
				!isDragging && !is_active && "hover:bg-primary/10 hover:text-primary dark:hover:bg-white",
				isDragging && "border-dashed border-2 border-primary !bg-transparent",
				disabled && "opacity-50 pointer-events-none"
			)}
		>
			<button
				ref={handle_ref}
				type="button"
				className={cn(
					"cursor-grab touch-none -translate-x-0.5 duration-200",
					is_active ? "text-white/70" : "text-primary",
					isDragging && "opacity-0",
					disabled && "cursor-not-allowed"
				)}
			>
				<MdDragIndicator size={16} />
			</button>
			<Link
				href={`${BOARD_ROUTES[board.type]}/${board.id}`}
				className={cn("flex items-center gap-[12] flex-1 min-w-0", isDragging && "opacity-0")}
			>
				<Icon className="shrink-0" /> {board.name}
			</Link>
		</div>
	);
};

export default SortableBoardLink;
