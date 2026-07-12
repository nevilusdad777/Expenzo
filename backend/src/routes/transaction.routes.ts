import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { validate } from '../middleware/validate';
import {
  createTransactionSchema,
  transactionIdParamSchema,
  transactionQuerySchema,
  updateTransactionSchema,
} from '../validators/transaction.validator';

const router = Router();

router.get('/transactions', validate(transactionQuerySchema, 'query'), transactionController.listTransactions);
router.get('/transactions/:id', validate(transactionIdParamSchema, 'params'), transactionController.getTransaction);
router.post('/transactions', validate(createTransactionSchema), transactionController.createTransaction);
router.patch('/transactions/:id', validate(transactionIdParamSchema, 'params'), validate(updateTransactionSchema), transactionController.updateTransaction);
router.delete('/transactions/:id', validate(transactionIdParamSchema, 'params'), transactionController.deleteTransaction);

export default router;