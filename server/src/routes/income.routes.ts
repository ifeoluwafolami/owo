import { Router } from "express";
import { createIncome, deleteIncome, listIncome, updateIncome } from "../controllers/income.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import { createIncomeSchema, listQuerySchema, mongoIdParamsSchema, updateIncomeSchema } from "../validators/finance.validators.js";

export const incomeRouter = Router();
incomeRouter.use(authenticate);
incomeRouter.get("/", validateQuery(listQuerySchema), listIncome);
incomeRouter.post("/", validateBody(createIncomeSchema), createIncome);
incomeRouter.patch("/:id", validateParams(mongoIdParamsSchema), validateBody(updateIncomeSchema), updateIncome);
incomeRouter.delete("/:id", validateParams(mongoIdParamsSchema), deleteIncome);
