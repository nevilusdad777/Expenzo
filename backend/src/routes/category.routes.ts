import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { validate } from '../middleware/validate';
import {
  categoryIdParamSchema,
  createCategorySchema,
  deleteCategoryQuerySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from '../validators/category.validator';

const router = Router();

router.get('/categories', validate(listCategoriesQuerySchema, 'query'), categoryController.listCategories);
router.get('/categories/:id', validate(categoryIdParamSchema, 'params'), categoryController.getCategory);
router.post('/categories', validate(createCategorySchema), categoryController.createCategory);
router.patch('/categories/:id', validate(categoryIdParamSchema, 'params'), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/categories/:id', validate(categoryIdParamSchema, 'params'), validate(deleteCategoryQuerySchema, 'query'), categoryController.deleteCategory);

export default router;