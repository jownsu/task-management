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
    tasks?: Task[];
}

export interface Task {
    id: string;
    title: string;
    total_subtask: number;
    completed_sub_task: number;
}