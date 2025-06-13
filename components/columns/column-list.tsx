"use client";

/* COMPONENTS */
import ColumnItem from "@/components/columns/column-item";
import EmptyBoard from "@/components/columns/empty-board";
import CreateColumnItem from "@/components/columns/create-column-item";

const columns = [
	{
		id: "1",
		title: "Todo",
		tasks: [
			{
				id: "1",
				title: "Task 1",
				total_subtask: 5,
				completed_sub_task: 2
			}
		]
	},
	{
		id: "2",
		title: "Doing",
		tasks: [
			{
				id: "1",
				title: "Task 1",
				total_subtask: 5,
				completed_sub_task: 2
			}
		]
	},
	{
		id: "3",
		title: "Done",
		tasks: [
			{
				id: "1",
				title: "Task 1",
				total_subtask: 5,
				completed_sub_task: 2
			}
		]
	}
];

const ColumnList = () => {
    
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
