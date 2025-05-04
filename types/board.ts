export interface Board {
    id: string;
    title: string;
    user_id: string;
    columns: Columns[];
}

export interface Columns {
    id?: string;
    title: string;
}