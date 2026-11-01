import type { NextFunction, Request, Response } from "express";
import { BudgetCategoryModel } from "../models/budget-category.model.js";
import { ExpenseModel } from "../models/expense.model.js";
import { AppError } from "../utils/app-error.js";
import type { CreateBudgetCategoryInput, UpdateBudgetCategoryInput } from "../validators/finance.validators.js";

export async function listBudgetCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const categories = await BudgetCategoryModel.find({
            user: req.user?.sub,
            archivedAt: null,
        }).sort({ createdAt: 1 });

        res.json({ categories });
    } catch (error) {
        next(error);
    }
}

export async function createBudgetCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const input = req.body as CreateBudgetCategoryInput;
        const category = await BudgetCategoryModel.create({ ...input, user: req.user?.sub });
        res.status(201).json({ category });
    } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
            next(new AppError(409, "A budget category with this name already exists."));
            return;
        }
        next(error);
    }
}

export async function updateBudgetCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const category = await BudgetCategoryModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user?.sub, archivedAt: null },
            { $set: req.body as UpdateBudgetCategoryInput },
            { new: true, runValidators: true }
        );

        if (!category) throw new AppError(404, "Budget category not found.");
        res.json({ category });
    } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
            next(new AppError(409, "A budget category with this name already exists."));
            return;
        }
        next(error);
    }
}

export async function archiveBudgetCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const hasExpenses = await ExpenseModel.exists({ user: req.user?.sub, category: req.params.id });
        if (hasExpenses) {
            throw new AppError(409, "This category has expenses and cannot be deleted; rename it instead.");
        }

        const category = await BudgetCategoryModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user?.sub, archivedAt: null },
            { $set: { archivedAt: new Date() } },
            { new: true }
        );

        if (!category) throw new AppError(404, "Budget category not found.");
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
