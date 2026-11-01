import { z } from "zod";

const money = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const positiveMoney = money.min(1);
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");
const dateInput = z.coerce.date();

export const mongoIdParamsSchema = z.object({ id: objectId });
export const goalContributionParamsSchema = z.object({
    id: objectId,
    contributionId: objectId.optional(),
});

export const listQuerySchema = z.object({
    from: dateInput.optional(),
    to: dateInput.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    cursor: dateInput.optional(),
}).refine(
    ({ from, to }) => !from || !to || from <= to,
    { message: "from must be before or equal to to", path: ["from"] }
);

export const createBudgetCategorySchema = z.object({
    name: z.string().trim().min(1).max(80),
    monthlyLimit: money,
});

export const updateBudgetCategorySchema = createBudgetCategorySchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update");

export const createExpenseSchema = z.object({
    categoryId: objectId,
    name: z.string().trim().min(1).max(120),
    amount: positiveMoney,
    occurredAt: dateInput,
    note: z.string().trim().max(500).optional(),
});

export const updateExpenseSchema = createExpenseSchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update");

export const createIncomeSchema = z.object({
    source: z.string().trim().min(1).max(120),
    amount: positiveMoney,
    receivedAt: dateInput,
    note: z.string().trim().max(500).optional(),
});

export const updateIncomeSchema = createIncomeSchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update");

export const createSavingsGoalSchema = z.object({
    title: z.string().trim().min(1).max(120),
    targetAmount: positiveMoney,
    targetDate: dateInput,
});

export const updateSavingsGoalSchema = createSavingsGoalSchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update");

export const createSavingsContributionSchema = z.object({
    amount: positiveMoney,
    contributedAt: dateInput,
    note: z.string().trim().max(500).optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
export type CreateBudgetCategoryInput = z.infer<typeof createBudgetCategorySchema>;
export type UpdateBudgetCategoryInput = z.infer<typeof updateBudgetCategorySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>;
export type CreateSavingsContributionInput = z.infer<typeof createSavingsContributionSchema>;
