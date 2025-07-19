/* SCHEMA */
import { DeleteColumnSchemaType } from "@/schema/column-schema";

/* SERVICES */
import APIClient from "@/services/apiClient";

class ColumnService extends APIClient{
    constructor(){
        super("/");
    }

    /**
	 * DOCU: Will delete the selected column. <br>
	 * Triggered: On submission of delete column form. <br>
	 */
    deleteColumn = async (payload: DeleteColumnSchemaType) => {
        const response = await this.delete(`boards/${payload.board_id}/columns/${payload.column_id}`)
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

const columnService = new ColumnService();
export default columnService;
