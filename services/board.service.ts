/* SERVICES */
import APIClient from "@/services/apiClient";

/* TYPES */
import { Board } from "@/types";

interface GetBoardsResponse {
	all_boards: Board[];
	selected_board: Board;
}

class BoardService extends APIClient{
    constructor(){
        super("/board");
    }

    getBoards = async (board_id?: string) => {
        const response = await this.get<GetBoardsResponse>("/", { params: { board_id } })
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
