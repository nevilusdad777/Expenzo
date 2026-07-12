import { NextFunction, Request, Response } from 'express';
import * as accountService from '../services/account.service';
import { HTTP_STATUS } from '../config/constants';

function userId(req: Request) {
  return req.session!.userId;
}

export async function listAccounts(req: Request, res: Response, next: NextFunction) {
  try {
    const { includeArchived = false } = req.query as { includeArchived?: boolean };
    const accounts = await accountService.listAccounts(userId(req), includeArchived);
    res.status(HTTP_STATUS.OK).json({ success: true, data: accounts });
  } catch (err) {
    next(err);
  }
}

export async function getAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const account = await accountService.getAccount(userId(req), id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
}

export async function createAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const account = await accountService.addAccount(userId(req), req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
}

export async function updateAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const account = await accountService.editAccount(userId(req), id, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
}

export async function archiveAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const account = await accountService.archiveAccountById(userId(req), id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
}

export async function unarchiveAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const account = await accountService.unarchiveAccountById(userId(req), id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    await accountService.deleteAccountById(userId(req), id);
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}

export async function getBalanceHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const { limit = 30 } = req.query as { limit?: number };
    const history = await accountService.getAccountBalanceHistory(userId(req), id, limit);
    res.status(HTTP_STATUS.OK).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}
