/* SCHEMA */
import { UpdateSubtaskSchemaType } from "@/schema/task-schema";

/* SERVICES */
import APIClient from "@/services/apiClient";

class TaskService extends APIClient{
    constructor(){
        super("/");
    }

    /**
	 * DOCU: Will update the status of subtask. <br>
	 * Triggered: On submission of update subtask form. <br>
	 */
    updateSubtask = async (payload: UpdateSubtaskSchemaType) => {
        const response = await this.post("update_subtask", { ...payload })
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

const taskService = new TaskService();
export default taskService;
