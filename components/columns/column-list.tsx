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
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* TYPES */
import { Column, Task } from "@/types";
import TaskItem from "./task-item";

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

	/**
	 * DOCU: Finds a task by its ID across all columns for the drag overlay. <br>
	 * Triggered: When DragOverlay renders during an active drag. <br>
	 * Last Updated: March 17, 2026
	 * @author Jhones
	 */
	const findTaskById = (id: string): Task | undefined => {
		for (const column of columns) {
			const task = column.tasks?.find((t) => t.id === id);
			if (task) return task;
		}
	};

	return (
		<DragDropProvider onDragOver={handleDragOver}>
			<div className="h-full flex gap-[24]">
				{columns.map((column) => (
					<ColumnItem key={column.id} column={column} />
				))}
				<CreateColumnItem />
			</div>
			<DragOverlay dropAnimation={null}>
				{(source) => {
					const task = findTaskById(source.id as string);
					if (!task) return null;

					return (
						<TaskItem
							task={{...task, id: "0"}}
							column_id={""}
							index={0}
						/>
					);
				}}
			</DragOverlay>
		</DragDropProvider>
	);
};

export default ColumnList;
