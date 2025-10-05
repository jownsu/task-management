import { Response } from "express";
import { ApiResponse } from "@/types";

export function success<T>(
	res: Response,
	data: T,
	message?: string,
	statusCode: number = 200,
): void {
	const response: ApiResponse<T> = {
		success: true,
		data,
	};

	if (message) {
		response.data = {
			message,
			...(typeof data === "object" && data !== null ? data : { data }),
		} as T;
	}

	res.status(statusCode).json(response);
}

export function error(
	res: Response,
	message: string,
	statusCode: number = 500,
	details?: any,
): void {
	const response: ApiResponse = {
		success: false,
		error: {
			message,
			details,
		},
	};

	res.status(statusCode).json(response);
}

export function created<T>(res: Response, data: T, message?: string): void {
	success(res, data, message, 201);
}

export function notFound(
	res: Response,
	message: string = "Resource not found",
): void {
	error(res, message, 404);
}

export function badRequest(
	res: Response,
	message: string = "Bad request",
	details?: any,
): void {
	error(res, message, 400, details);
}

export function unauthorized(
	res: Response,
	message: string = "Unauthorized",
): void {
	error(res, message, 401);
}

export function forbidden(res: Response, message: string = "Forbidden"): void {
	error(res, message, 403);
}

export function conflict(res: Response, message: string = "Conflict"): void {
	error(res, message, 409);
}

export function internalError(
	res: Response,
	message: string = "Internal server error",
): void {
	error(res, message, 500);
}
