"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useEffect, useState } from "react";

/* COMPONENTS */
import ColumnItem from "@/components/columns/column-item";
import EmptyBoard from "@/components/columns/empty-board";
import CreateColumnItem from "@/components/columns/create-column-item";

/* PLUGINS */
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* TYPES */
import { Column, Task } from "@/types";

const ColumnList = () => {

	const { board_id } = useParams() as { board_id: string };
	const { board } = useGetBoard(board_id);
	const [columns, setColumns] = useState<Column[]>(board?.columns || []);

	useEffect(() => {
		setColumns(board?.columns || []);
	}, [board?.columns]);

	/**
	 * DOCU: Handles the drag over event to optimistically reorder tasks within and across columns. <br>
	 * Triggered: When a draggable task item is hovering over a drop target. <br>
	 * Last Updated: March 16, 2026
	 * @author Jhones
	 */
	const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = (event) => {
		setColumns((prev) => {
			const tasks_map: Record<string, Task[]> = {};

			for (const column of prev) {
				tasks_map[column.id] = column.tasks || [];
			}

			const updated_map = move(tasks_map, event);

			return prev.map((column) => ({
				...column,
				tasks: updated_map[column.id] || [],
			}));
		});
	};

	if(!columns.length){
		return <EmptyBoard />;
	}

	return (
		<DragDropProvider onDragOver={handleDragOver}>
			<div className="h-full flex gap-[24]">
				{columns.map((column) => (
					<ColumnItem key={column.id} column={column} />
				))}
				<CreateColumnItem />
			</div>
		</DragDropProvider>
	);
};

export default ColumnList;
