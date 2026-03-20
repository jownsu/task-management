"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useEffect, useRef, useState } from "react";

/* COMPONENTS */
import ColumnItem from "@/components/columns/column-item";
import EmptyBoard from "@/components/columns/empty-board";
import CreateColumnItem from "@/components/columns/create-column-item";
import TaskItem from "@/components/columns/task-item";

/* PLUGINS */
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

/* MUTATIONS */
import { useReorderTask } from "@/hooks/mutations/task.mutation";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

/* TYPES */
import { Column, Task } from "@/types";

const ColumnList = () => {

	const { board_id } = useParams() as { board_id: string };
	const { board } = useGetBoard(board_id);
	const { reorderTask, isPending: is_reordering } = useReorderTask();
	const [columns, setColumns] = useState<Column[]>(board?.columns || []);
	const columns_snapshot_ref = useRef<Column[]>([]);

	useEffect(() => {
		setColumns(board?.columns || []);
	}, [board?.columns]);

	/**
	 * DOCU: Captures the current columns state before dragging starts for rollback on cancel. <br>
	 * Triggered: When a draggable task item starts being dragged. <br>
	 * Last Updated: March 20, 2026
	 * @author Jhones
	 */
	const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
		columns_snapshot_ref.current = columns;
	};

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

	/**
	 * DOCU: Persists the task reorder or cross-column move to the server on drag end. <br>
	 * Triggered: When a draggable task item is dropped after dragging. <br>
	 * Last Updated: March 20, 2026
	 * @author Jhones
	 */
	const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = (event) => {
		/* If drag was canceled, revert to pre-drag state */
		if (event.canceled) {
			setColumns(columns_snapshot_ref.current);
			return;
		}

		const task_id = event.operation.source?.id as string | undefined;

		if (!task_id) {
			setColumns(columns_snapshot_ref.current);
			return;
		}

		/* Find the column that now contains this task (from local state, already updated by onDragOver) */
		const target_column = columns.find((column) => column.tasks?.some((task) => task.id === task_id));

		if (!target_column) {
			setColumns(columns_snapshot_ref.current);
			return;
		}

		/* Build updated_task_order from the current local state */
		const updated_task_order = target_column.tasks?.map((task) => task.id) || [];

		/* Skip mutation if the task didn't change column or position */
		const snapshot_column = columns_snapshot_ref.current.find((column) => column.tasks?.some((task) => task.id === task_id));
		const snapshot_task_order = snapshot_column?.tasks?.map((task) => task.id) || [];

		if (snapshot_column?.id === target_column.id && JSON.stringify(snapshot_task_order) === JSON.stringify(updated_task_order)) {
			return;
		}

		/* Persist the reorder/move to the server */
		reorderTask({
			board_id,
			task_id,
			updated_column_id: target_column.id,
			updated_task_order
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
		<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
			<div className="h-full flex gap-[24]">
				{columns.map((column) => (
					<ColumnItem key={column.id} column={column} is_reordering={is_reordering} />
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
