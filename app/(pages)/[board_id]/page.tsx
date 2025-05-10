/* COMPONENTS */
import EmptyBoard from "@/components/columns/empty-board";

const COLUMNS = []

const TaskPage = () => {

	if(!COLUMNS.length){
		return <EmptyBoard />
	}

	return <div>TaskPage</div>;
};

export default TaskPage;
