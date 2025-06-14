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
}

export default new BoardService();
