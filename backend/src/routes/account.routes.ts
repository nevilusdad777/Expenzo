import { Router } from 'express';
import * as accountController from '../controllers/account.controller';
import { validate } from '../middleware/validate';
import {
  accountIdParamSchema,
  createAccountSchema,
  getAccountBalanceHistoryQuerySchema,
  listAccountsQuerySchema,
  updateAccountSchema,
} from '../validators/account.validator';

const router = Router();

router.get('/accounts', validate(listAccountsQuerySchema, 'query'), accountController.listAccounts);
router.get('/accounts/:id', validate(accountIdParamSchema, 'params'), accountController.getAccount);
router.get(
  '/accounts/:id/balance-history',
  validate(accountIdParamSchema, 'params'),
  validate(getAccountBalanceHistoryQuerySchema, 'query'),
  accountController.getBalanceHistory
);
router.post('/accounts', validate(createAccountSchema), accountController.createAccount);
router.patch('/accounts/:id', validate(accountIdParamSchema, 'params'), validate(updateAccountSchema), accountController.updateAccount);
router.patch('/accounts/:id/archive', validate(accountIdParamSchema, 'params'), accountController.archiveAccount);
router.patch('/accounts/:id/unarchive', validate(accountIdParamSchema, 'params'), accountController.unarchiveAccount);
router.delete('/accounts/:id', validate(accountIdParamSchema, 'params'), accountController.deleteAccount);

export default router;