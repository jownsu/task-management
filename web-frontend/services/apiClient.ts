/* PLUGINS */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export interface ResponseData<ReturnType> {
	status: boolean;
	result?: ReturnType;
	error: unknown;
	message: string | null;
}

class APIClient {
	private axios_instance: AxiosInstance;
	endpoint: string;

	constructor(endpoint: string = "", config?: AxiosRequestConfig) {
		this.endpoint = endpoint;
		this.axios_instance = axios.create({
			baseURL: process.env.NEXT_PUBLIC_API_URL,
			headers: {
				"Content-Type": "application/json",
				...config?.headers
			},
			...config
		});
	}

	/**
	 * DOCU: This function will send GET request to the backend API. <br>
	 * Triggered: Being used by all services. <br>
	 */
	get = <ReturnType>(url: string, config?: AxiosRequestConfig) => {
		return this.axios_instance
			.get<ResponseData<ReturnType>>(`${this.endpoint}${url}`, config)
			.then((res) => res.data)
			.catch((error) => {
				throw error;
			});
	};

	/**
	 * DOCU: This function will send POST request to the backend API. <br>
	 * Triggered: Being used by all services. <br>
	 */
	post = <ReturnType, T = unknown>(url?: string, params?: T, config?: AxiosRequestConfig) => {
		return this.axios_instance
			.post<ResponseData<ReturnType>>(`${this.endpoint}${url}`, params, config)
			.then((res) => res.data)
			.catch((error) => {
				throw error;
			});
	};

	/**
	 * DOCU: This function will send PUT request to the backend API. <br>
	 * Triggered: Being used by all services. <br>
	 */
	put = <ReturnType, T = unknown>(url?: string, params?: T, config?: AxiosRequestConfig) => {
		return this.axios_instance
			.put<ResponseData<ReturnType>>(`${this.endpoint}${url}`, params, config)
			.then((res) => res.data)
			.catch((error) => {
				throw error;
			});
	};

	/**
	 * DOCU: This function will send DELETE request to the backend API. <br>
	 * Triggered: Being used by all services. <br>
	 */
	delete = <ReturnType>(url?: string, config?: AxiosRequestConfig) => {
		return this.axios_instance
			.delete<ResponseData<ReturnType>>(`${this.endpoint}${url}`, config)
			.then((res) => res.data)
			.catch((error) => {
				throw error;
			});
	};
}

export default APIClient;
