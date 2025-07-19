/* SCHEMA */
import { AddBoardSchema, DeleteBoardSchema, EditBoardSchema } from "@/schema/board-schema";

/* SERVICES */
import APIClient from "@/services/apiClient";

/* TYPES */
import { Board } from "@/types";

class BoardService extends APIClient{
    constructor(){
        super("/boards");
    }

    /**
	 * DOCU: Will get all boards for sidebar. <br>
	 * Triggered: On load of the page. <br>
	 */
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

    /**
	 * DOCU: Will get the selected board. <br>
	 * Triggered: On load of specific board page. <br>
	 */
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

    /**
	 * DOCU: Will create a new board. <br>
	 * Triggered: On submission of new board form. <br>
	 */
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

    /**
	 * DOCU: Will edit the selected board. <br>
	 * Triggered: On submission of edit board form. <br>
	 */
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

    
    /**
	 * DOCU: Will delete the selected board. <br>
	 * Triggered: On submission of delete board form. <br>
	 */
    deleteBoard = async (payload: DeleteBoardSchema) => {
        const response = await this.delete(`/${payload.id}`)
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
