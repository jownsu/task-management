"use client";

/* COMPONENTS */
import ColumnItem from "@/components/columns/column-item";
import EmptyBoard from "@/components/columns/empty-board";
import CreateColumnItem from "@/components/columns/create-column-item";

/* CONSTANTS */
import { useGetColumn } from "@/queries/column.query";
import { useParams } from "next/navigation";

const ColumnList = () => {
	const { board_id } = useParams() as { board_id: string };

    const { columns } = useGetColumn(board_id);
    
    if(!columns?.length){
        return <EmptyBoard />;
    }

	return (
		<div className="h-full flex gap-[24]">
			{columns?.map((column) => (
				<ColumnItem key={column.id} column={column} />
			))}
			<CreateColumnItem />
		</div>
	);
};

export default ColumnList;
