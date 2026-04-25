/* COMPONENTS */
import MainContainer from "@/components/main-container";
import Navbar from "@/components/navigation/navbar";
import TaskManagement from "@/components/board/task-management";

/* PLUGINS */
import { HydrationBoundary } from "@tanstack/react-query";

/* QUERIES */
import { prefetchTaskManagementBoard } from "@/hooks/queries/task-management-board.query";

interface Props {
	params: {
		board_id: string;
	}
}

/**
 * DOCU: Task-management board detail page. <br>
 * Triggered: On navigation to /tasks/[board_id]. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
const TaskManagementPage = async ({ params }: Props) => {
	const { board_id } = (await params) as { board_id: string };
	const { dehydrated_state } = await prefetchTaskManagementBoard(board_id);

	return (
		<HydrationBoundary state={dehydrated_state}>
			<Navbar />

			<MainContainer>
				<TaskManagement />
			</MainContainer>
		</HydrationBoundary>
	);
};

export default TaskManagementPage;
