import { Request, Response } from 'express';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Request with user (for future authentication)
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// Controller function type
export type ControllerFunction = (
  req: Request,
  res: Response
) => Promise<void> | void;

// Authenticated controller function type
export type AuthenticatedControllerFunction = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<void> | void;

// Common query parameters
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Common search parameters
export interface SearchQuery extends PaginationQuery {
  search?: string;
  filter?: string;
}
