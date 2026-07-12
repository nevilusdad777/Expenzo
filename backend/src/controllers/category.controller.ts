import { NextFunction, Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { HTTP_STATUS } from '../config/constants';

function userId(req: Request) {
  return req.session!.userId;
}

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const type = req.query.type as 'INCOME' | 'EXPENSE' | undefined;
    const categories = await categoryService.listCategories(userId(req), type);
    res.status(HTTP_STATUS.OK).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const category = await categoryService.getCategory(userId(req), id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.addCategory(userId(req), req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const category = await categoryService.editCategory(userId(req), id, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const { force = false } = req.query as { force?: boolean };
    await categoryService.removeCategory(userId(req), id, force);
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}
