"use client";

/* NEXT */
import { useParams } from "next/navigation";

/* COMPONENTS */
import ColumnItem from "@/components/columns/column-item";
import EmptyBoard from "@/components/columns/empty-board";
import CreateColumnItem from "@/components/columns/create-column-item";

/* QUERIES */
import { useGetBoard } from "@/hooks/queries/board.query";

const ColumnList = () => {

	const { board_id } = useParams() as { board_id: string };
	const { board } = useGetBoard(board_id);
    
    if(!board?.columns?.length){
        return <EmptyBoard />;
    }

	return (
		<div className="h-full flex gap-[24]">
			{board?.columns?.map((column) => (
				<ColumnItem key={column.id} column={column} />
			))}
			<CreateColumnItem />
		</div>
	);
};

export default ColumnList;
