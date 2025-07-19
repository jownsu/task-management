/* SCHEMA */
import { AddBoardSchema, EditBoardSchema } from "@/schema/board-schema";

/* SERVICES */
import APIClient from "@/services/apiClient";

/* TYPES */
import { Board } from "@/types";

class BoardService extends APIClient{
    constructor(){
        super("/boards");
    }

    getAllBoards = async () => {
        const response = await this.get<Omit<Board, "columns">[]>("/")
            .then((res) => {
                if(!res.status){
                    throw res.error;
                }
                return res.result;
            })
            .catch((error) => {
                throw error;
            });

        return response;
    };

    getBoard = async (board_id?: string) => {
        const response = await this.get<Board>(`/${board_id}`)
            .then((res) => {
                if(!res.status){
                    throw res.error;
                }
                return res.result;
            })
            .catch((error) => {
                throw error;
            });

        return response;
    };

    createBoard = async (payload: AddBoardSchema) => {
        const response = await this.post<Board>("/", { ...payload })
            .then((res) => {
                if(!res.status){
                    throw res.error;
                }
                return res.result;
            })
            .catch((error) => {
                throw error;
            });

        return response;
    };

    editBoard = async (payload: EditBoardSchema) => {
        const response = await this.put<Board>(`/${payload.id}`, { ...payload })
            .then((res) => {
                if(!res.status){
                    throw res.error;
                }
                return res.result;
            })
            .catch((error) => {
                throw error;
            });

        return response;
    };
}

const boardService = new BoardService();
export default boardService;
