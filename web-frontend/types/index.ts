export interface CallbackResponse<T = unknown> {
	onSuccess?: (data?: T) => void;
	onError?: (error_msg?: string) => void;
}

export interface Board {
    id: string;
    title: string;
    columns?: Column[];
}

export interface Column {
    id: string;
    title: string;
    is_new?: boolean;
    tasks?: Task[];
}

export interface SubTask {
    id: string;
    title: string;
    is_completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    subtasks: SubTask[];
}

export interface UpdateSubTaskPayload {
    board_id: string;
    column_id: string;
    task_id: string;
    subtask_id: string;
    is_completed: boolean;
}