import { NextFunction, Request, Response } from 'express';
import * as transactionService from '../services/transaction.service';
import { HTTP_STATUS } from '../config/constants';

function userId(req: Request) {
  return req.session!.userId;
}

export async function listTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await transactionService.listTransactions(userId(req), req.query as any);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.items,
      meta: { nextCursor: result.nextCursor, hasMore: result.hasMore },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const transaction = await transactionService.getTransaction(userId(req), id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function createTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const transaction = await transactionService.createTransaction(userId(req), req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function updateTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const transaction = await transactionService.editTransaction(userId(req), id, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    await transactionService.deleteTransaction(userId(req), id);
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}
