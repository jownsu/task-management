import { Request, Response, NextFunction } from "express";
import { badRequest, internalError } from "./response";

export const validateRequest = (schema: any) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			const { error } = schema.validate(req.body);
			if (error) {
				badRequest(res, error.details[0].message);
				return;
			}
			next();
		} catch (err) {
			internalError(res, "Validation error");
		}
	};
};

export const validateQuery = (schema: any) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			const { error } = schema.validate(req.query);
			if (error) {
				badRequest(res, error.details[0].message);
				return;
			}
			next();
		} catch (err) {
			internalError(res, "Query validation error");
		}
	};
};

export const validateParams = (schema: any) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			const { error } = schema.validate(req.params);
			if (error) {
				badRequest(res, error.details[0].message);
				return;
			}
			next();
		} catch (err) {
			internalError(res, "Parameter validation error");
		}
	};
};
