import type { NextFunction, Request, Response } from "express";
import { BudgetCategoryModel } from "../models/budget-category.model.js";
import { ExpenseModel } from "../models/expense.model.js";
import { AppError } from "../utils/app-error.js";
import type { CreateExpenseInput, ListQuery, UpdateExpenseInput } from "../validators/finance.validators.js";

function dateFilter(query: ListQuery, field: string): Record<string, unknown> {
    const range: Record<string, Date> = {};
    if (query.from) range.$gte = query.from;
    if (query.to) range.$lte = query.to;
    if (query.cursor) range.$lt = query.cursor;
    return Object.keys(range).length ? { [field]: range } : {};
}

export async function listExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const query = res.locals.validatedQuery as ListQuery;
        const expenses = await ExpenseModel.find({
            user: req.user?.sub,
            ...dateFilter(query, "occurredAt"),
        })
            .populate("category", "name monthlyLimit")
            .sort({ occurredAt: -1, _id: -1 })
            .limit(query.limit);

        res.json({
            expenses,
            nextCursor: expenses.length === query.limit
                ? expenses.at(-1)?.occurredAt.toISOString() ?? null
                : null,
        });
    } catch (error) {
        next(error);
    }
}

export async function createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { categoryId, ...input } = req.body as CreateExpenseInput;
        const category = await BudgetCategoryModel.exists({
            _id: categoryId,
            user: req.user?.sub,
            archivedAt: null,
        });
        if (!category) throw new AppError(400, "Budget category not found.");

        const expense = await ExpenseModel.create({
            ...input,
            category: categoryId,
            user: req.user?.sub,
        });
        await expense.populate("category", "name monthlyLimit");
        res.status(201).json({ expense });
    } catch (error) {
        next(error);
    }
}

export async function updateExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { categoryId, ...input } = req.body as UpdateExpenseInput;
        const update: Record<string, unknown> = { ...input };

        if (categoryId) {
            const category = await BudgetCategoryModel.exists({
                _id: categoryId,
                user: req.user?.sub,
                archivedAt: null,
            });
            if (!category) throw new AppError(400, "Budget category not found.");
            update.category = categoryId;
        }

        const expense = await ExpenseModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user?.sub },
            { $set: update },
            { new: true, runValidators: true }
        ).populate("category", "name monthlyLimit");

        if (!expense) throw new AppError(404, "Expense not found.");
        res.json({ expense });
    } catch (error) {
        next(error);
    }
}

export async function deleteExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const expense = await ExpenseModel.findOneAndDelete({ _id: req.params.id, user: req.user?.sub });
        if (!expense) throw new AppError(404, "Expense not found.");
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
