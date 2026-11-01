import { Router } from "express";
import { archiveBudgetCategory, createBudgetCategory, listBudgetCategories, updateBudgetCategory } from "../controllers/budget.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { createBudgetCategorySchema, mongoIdParamsSchema, updateBudgetCategorySchema } from "../validators/finance.validators.js";

export const budgetRouter = Router();
budgetRouter.use(authenticate);
budgetRouter.get("/", listBudgetCategories);
budgetRouter.post("/", validateBody(createBudgetCategorySchema), createBudgetCategory);
budgetRouter.patch("/:id", validateParams(mongoIdParamsSchema), validateBody(updateBudgetCategorySchema), updateBudgetCategory);
budgetRouter.delete("/:id", validateParams(mongoIdParamsSchema), archiveBudgetCategory);
