export interface Board {
    id: number;
    name: string;
    columns: Columns[];
}

export interface Columns {
    id: number;
    name: string;
}