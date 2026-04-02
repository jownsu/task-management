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

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	board: { id: string; name: string };
	index: number;
	is_active: boolean;
	disabled?: boolean;
}

/**
 * DOCU: Wraps a board link with drag-and-drop sortable functionality and a drag handle. <br>
 * Triggered: When rendering board links in the sidebar boards list. <br>
 * Last Updated: April 02, 2026
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
					"cursor-grab -translate-x-0.5 duration-200",
					is_active ? "text-white/70" : "text-primary",
					isDragging && "opacity-0",
					disabled && "cursor-not-allowed"
				)}
			>
				<MdDragIndicator size={16} />
			</button>
			<Link
				href={`/${board.id}`}
				className={cn("flex items-center gap-[12] flex-1 min-w-0", isDragging && "opacity-0")}
			>
				<IconBoardLink className="shrink-0" /> {board.name}
			</Link>
		</div>
	);
};

export default SortableBoardLink;
