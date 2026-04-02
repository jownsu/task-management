"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* REACT */
import { useEffect, useRef, useState } from "react";

/* COMPONENTS */
import CreateBoardButton from "@/components/board/create-board-button";
import SortableBoardLink from "@/components/navigation/sortable-board-link";

/* PLUGINS */
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

/* ICONS */
import IconBoardLink from "@/public/icon-board-link.svg";
import { MdDragIndicator } from "react-icons/md";

/* QUERIES */
import { useGetAllBoards } from "@/hooks/queries/all_boards.query";

/* MUTATIONS */
import { useReorderBoard } from "@/hooks/mutations/board.mutation";

/* TYPES */
import { Board } from "@/types";

type BoardItem = Omit<Board, "columns" | "columnOrder">;

const BoardsList = () => {

	const { boards: fetched_boards } = useGetAllBoards();
	const { board_id } = useParams();
	const { reorderBoard, isPending: is_reordering } = useReorderBoard();
	const [boards, setBoards] = useState<BoardItem[]>(fetched_boards || []);
	const boards_snapshot_ref = useRef<BoardItem[]>([]);

	useEffect(() => {
		setBoards(fetched_boards || []);
	}, [fetched_boards]);

	/**
	 * DOCU: Captures the current boards state before dragging starts for rollback on cancel. <br>
	 * Triggered: When a board link starts being dragged. <br>
	 * Last Updated: April 02, 2026
	 * @author Jhones
	 */
	const handleDragStart: React.ComponentProps<typeof DragDropProvider>["onDragStart"] = () => {
		boards_snapshot_ref.current = boards;
	};

	/**
	 * DOCU: Handles the drag over event to optimistically reorder boards in the sidebar. <br>
	 * Triggered: When a dragged board link is hovering over another board link. <br>
	 * Last Updated: April 02, 2026
	 * @author Jhones
	 */
	const handleDragOver: React.ComponentProps<typeof DragDropProvider>["onDragOver"] = (event) => {
		setBoards((prev) => move(prev, event));
	};

	/**
	 * DOCU: Persists the board reorder to the server on drag end, or reverts on cancel. <br>
	 * Triggered: When a dragged board link is dropped after dragging. <br>
	 * Last Updated: April 02, 2026
	 * @author Jhones
	 */
	const handleDragEnd: React.ComponentProps<typeof DragDropProvider>["onDragEnd"] = (event) => {
		/* If drag was canceled, revert to pre-drag state */
		if (event.canceled) {
			setBoards(boards_snapshot_ref.current);
			return;
		}

		const dragged_board_id = event.operation.source?.id as string | undefined;

		if (!dragged_board_id) {
			setBoards(boards_snapshot_ref.current);
			return;
		}

		/* Build updated board order from the current local state */
		const updated_board_order = boards.map((board) => board.id);

		/* Skip mutation if the order didn't change */
		const snapshot_order = boards_snapshot_ref.current.map((board) => board.id);

		if (JSON.stringify(snapshot_order) === JSON.stringify(updated_board_order)) {
			return;
		}

		/* Persist the reorder to the server */
		reorderBoard({ updated_board_order });
	};

	/**
	 * DOCU: Finds a board by its ID for the drag overlay. <br>
	 * Triggered: When DragOverlay renders during an active drag. <br>
	 * Last Updated: April 02, 2026
	 * @author Jhones
	 */
	const findBoardById = (id: string): BoardItem | undefined => {
		return boards.find((board) => board.id === id);
	};

	return (
		<div>
			<h2 className="text-medium-grey uppercase t-[12] tracking-[2.4] px-[24] py-[16] font-bold">
				All Boards ({boards?.length})
			</h2>
			<DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
				<div className="flex flex-col pr-[24]">
					{boards?.map((board, index) => (
						<SortableBoardLink
							key={board.id}
							board={board}
							index={index}
							is_active={board.id === board_id}
							disabled={is_reordering}
						/>
					))}

					<CreateBoardButton />
				</div>
				<DragOverlay dropAnimation={null}>
					{(source) => {
						const board = findBoardById(source.id as string);
						if (!board) return null;

						return (
							<div className="flex items-center h-[48] pl-[16] rounded-r-full bg-foreground drop-shadow-md text-medium-grey !text-h-md">
								<span className="text-primary -translate-x-0.5">
									<MdDragIndicator size={16} />
								</span>
								<span className="flex items-center gap-[12]">
									<IconBoardLink /> {board.name}
								</span>
							</div>
						);
					}}
				</DragOverlay>
			</DragDropProvider>
		</div>
	);
};

export default BoardsList;
