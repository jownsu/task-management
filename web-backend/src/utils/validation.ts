import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from './response';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        ResponseHelper.badRequest(res, error.details[0].message);
        return;
      }
      next();
    } catch (err) {
      ResponseHelper.internalError(res, 'Validation error');
    }
  };
};

export const validateQuery = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error } = schema.validate(req.query);
      if (error) {
        ResponseHelper.badRequest(res, error.details[0].message);
        return;
      }
      next();
    } catch (err) {
      ResponseHelper.internalError(res, 'Query validation error');
    }
  };
};

export const validateParams = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error } = schema.validate(req.params);
      if (error) {
        ResponseHelper.badRequest(res, error.details[0].message);
        return;
      }
      next();
    } catch (err) {
      ResponseHelper.internalError(res, 'Parameter validation error');
    }
  };
};
