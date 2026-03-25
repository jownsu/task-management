"use client";

/* REACT */
import { useRef, useState } from "react";

/* PLUGINS */
import { useSortable } from "@dnd-kit/react/sortable";

/* ICONS */
import { MdDragIndicator } from "react-icons/md";

/* UTILITIES */
import { cn } from "@/lib/utils";

interface Props {
	id: string;
	index: number;
	children: React.ReactNode;
	disabled?: boolean;
}

/**
 * DOCU: Wraps a column field with drag-and-drop sortable functionality and a drag handle. <br>
 * Triggered: When rendering column fields in create/edit board modals. <br>
 * Last Updated: March 23, 2026
 * @author Jhones
 */
const SortableColumnField = ({ id, index, children, disabled }: Props) => {
	const [element, setElement] = useState<Element | null>(null);
	const handle_ref = useRef<HTMLButtonElement | null>(null);

	const { isDragging } = useSortable({
		id,
		index,
		element,
		handle: handle_ref,
		type: "column-field",
		accept: "column-field",
		group: "columns",
		disabled
	});

	return (
		<div ref={setElement} className={cn("flex items-center rounded-md", isDragging && "border-dashed border-2 border-primary !bg-transparent")}>
			<button ref={handle_ref} type="button" className={cn("cursor-grab text-primary duration-200 -translate-x-0.5", isDragging && "opacity-0", disabled && "cursor-not-allowed")}>
				<MdDragIndicator size={16} />
			</button>
			<div className={cn("flex items-center flex-1 min-w-0", isDragging && "opacity-0")}>
				{children}
			</div>
		</div>
	);
};

export default SortableColumnField;
