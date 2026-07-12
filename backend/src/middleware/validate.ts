import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import { HTTP_STATUS } from '../config/constants';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodTypeAny, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
    }

    (req as any)[target] = result.data;
    next();
  };
}