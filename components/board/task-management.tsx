/* COMPONENTS */
import ColumnList from "@/components/columns/column-list";
import FilterBar from "@/components/columns/filter-bar";
import CreateColumnModal from "@/components/columns/create-column-modal";
import CreateTaskModal from "@/components/task/create-task-modal";
import EditTaskBoardModal from "@/components/board/edit-task-board-modal";
import DeleteBoardModal from "@/components/board/delete-board-modal";
import EditTagsModal from "@/components/board/edit-tags-modal";
import ViewTaskModal from "@/components/task/view-task-modal";
import EditTaskModal from "@/components/task/edit-task-modal";
import DeleteTaskModal from "@/components/task/delete-task-modal";

/**
 * DOCU: Renders the task management (kanban) board view with column list, filter bar, and all task/board modals. <br>
 * Triggered: On the board detail page when board.type is TASK_MANAGEMENT. <br>
 * Last Updated: April 18, 2026
 * @author Jhones
 */
const TaskManagement = () => {
	return (
		<div className="h-full overflow-auto p-[24]">
			<FilterBar />
			<ColumnList />

			{/* MODALS */}
			<CreateColumnModal />
			<CreateTaskModal />
			<EditTaskBoardModal />
			<EditTagsModal />
			<DeleteBoardModal />
			<ViewTaskModal />
			<EditTaskModal />
			<DeleteTaskModal />
		</div>
	);
};

export default TaskManagement;
