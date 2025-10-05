import { Response } from 'express';
import { ApiResponse } from '@/types';

export class ResponseHelper {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };

    if (message) {
      response.data = { message, ...(typeof data === 'object' && data !== null ? data : { data }) } as T;
    }

    res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode: number = 500, details?: any): void {
    const response: ApiResponse = {
      success: false,
      error: {
        message,
        details,
      },
    };

    res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string): void {
    this.success(res, data, message, 201);
  }

  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, 404);
  }

  static badRequest(res: Response, message: string = 'Bad request', details?: any): void {
    this.error(res, message, 400, details);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): void {
    this.error(res, message, 403);
  }

  static conflict(res: Response, message: string = 'Conflict'): void {
    this.error(res, message, 409);
  }

  static internalError(res: Response, message: string = 'Internal server error'): void {
    this.error(res, message, 500);
  }
}
