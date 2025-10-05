// Base model interface
export interface BaseModel {
	id: string;
	createdAt?: Date;
	updatedAt?: Date;
}

// Model interfaces matching your mock data structure
export interface Subtask extends BaseModel {
	title: string;
	is_completed: boolean;
}

export interface Task extends BaseModel {
	title: string;
	description: string;
	status: string;
	subtasks: Subtask[];
}

export interface Column extends BaseModel {
	title: string;
	tasks: Task[];
}

export interface Board extends BaseModel {
	title: string;
	columns: Column[];
}

// API Response interfaces matching your mock server responses
export interface ApiResponse<T = any> {
	status: boolean;
	result: T | null;
	error: string | null;
	message: string | null;
}

// Request interfaces for API endpoints
export interface CreateBoardRequest {
	title: string;
	columns: { title: string }[];
}

export interface UpdateBoardRequest {
	title: string;
	columns: Array<{
		id?: string;
		title: string;
		is_new?: boolean;
	}>;
}

export interface UpdateSubtaskRequest {
	board_id: string;
	column_id: string;
	task_id: string;
	subtask_id: string;
	is_completed: boolean;
}
