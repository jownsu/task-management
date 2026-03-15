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
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* MUTATIONS */
import { useReorderTask } from "@/hooks/mutations/task.mutation";

/* TYPES */
import { Column } from "@/types";

const ColumnList = () => {

	const { board_id } = useParams() as { board_id: string };
	const { board } = useGetBoard(board_id);
	const { reorderTask } = useReorderTask();
	const [columns, setColumns] = useState<Column[]>(board?.columns || []);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

	useEffect(() => {
		setColumns(board?.columns || []);
	}, [board?.columns]);

	/**
	 * DOCU: Handles the end of a drag and drop event to reorder tasks. <br>
	 * Triggered: When a draggable task item is dropped. <br>
	 * Last Updated: March 15, 2026
	 * @author Jhones
	 */
	const onDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		const column_id = active.data.current?.column_id;
		const column = columns.find((col) => col.id === column_id);
		const tasks = column?.tasks || [];
		const source_index = tasks.findIndex((task) => task.id === active.id);
		const destination_index = tasks.findIndex((task) => task.id === over.id);

		if (source_index === -1 || destination_index === -1) return;

		/* Update local state immediately for glitch-free UI */
		setColumns((prev) =>
			prev.map((col) => {
				if (col.id !== column_id) return col;

				const reordered_tasks = [...(col.tasks || [])];
				const [moved_task] = reordered_tasks.splice(source_index, 1);
				reordered_tasks.splice(destination_index, 0, moved_task);

				return { ...col, tasks: reordered_tasks };
			})
		);

		/* Persist the new order to the server */
		reorderTask({ board_id, column_id, source_index, destination_index });
	};

	if(!columns.length){
		return <EmptyBoard />;
	}

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
			<div className="h-full flex gap-[24]">
				{columns.map((column) => (
					<ColumnItem key={column.id} column={column} />
				))}
				<CreateColumnItem />
			</div>
		</DndContext>
	);
};

export default ColumnList;
