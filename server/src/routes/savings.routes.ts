import { Router } from "express";
import {
    archiveSavingsGoal,
    createSavingsContribution,
    createSavingsGoal,
    listSavingsContributions,
    listSavingsGoals,
    updateSavingsGoal,
} from "../controllers/savings.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
    createSavingsContributionSchema,
    createSavingsGoalSchema,
    listQuerySchema,
    mongoIdParamsSchema,
    updateSavingsGoalSchema,
} from "../validators/finance.validators.js";

export const savingsRouter = Router();
savingsRouter.use(authenticate);
savingsRouter.get("/goals", listSavingsGoals);
savingsRouter.post("/goals", validateBody(createSavingsGoalSchema), createSavingsGoal);
savingsRouter.patch("/goals/:id", validateParams(mongoIdParamsSchema), validateBody(updateSavingsGoalSchema), updateSavingsGoal);
savingsRouter.delete("/goals/:id", validateParams(mongoIdParamsSchema), archiveSavingsGoal);
savingsRouter.get("/contributions", validateQuery(listQuerySchema), listSavingsContributions);
savingsRouter.post(
    "/goals/:id/contributions",
    validateParams(mongoIdParamsSchema),
    validateBody(createSavingsContributionSchema),
    createSavingsContribution
);
