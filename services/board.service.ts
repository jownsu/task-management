/* SERVICES */
import APIClient from "@/services/apiClient";

/* TYPES */
import { Board } from "@/types";

class BoardService extends APIClient{
    constructor(){
        super("/boards");
    }

    getBoards = async (board_id?: string) => {
        const response = await this.get<Board[]>("/", { params: { board_id } })
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
