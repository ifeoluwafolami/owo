import { Router } from "express";
import { createExpense, deleteExpense, listExpenses, updateExpense } from "../controllers/expense.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import { createExpenseSchema, listQuerySchema, mongoIdParamsSchema, updateExpenseSchema } from "../validators/finance.validators.js";

export const expenseRouter = Router();
expenseRouter.use(authenticate);
expenseRouter.get("/", validateQuery(listQuerySchema), listExpenses);
expenseRouter.post("/", validateBody(createExpenseSchema), createExpense);
expenseRouter.patch("/:id", validateParams(mongoIdParamsSchema), validateBody(updateExpenseSchema), updateExpense);
expenseRouter.delete("/:id", validateParams(mongoIdParamsSchema), deleteExpense);
