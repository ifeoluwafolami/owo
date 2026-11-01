import type { NextFunction, Request, Response } from "express";
import { BudgetCategoryModel } from "../models/budget-category.model.js";
import { ExpenseModel } from "../models/expense.model.js";
import { IncomeModel } from "../models/income.model.js";
import { SavingsContributionModel } from "../models/savings-contribution.model.js";
import { SavingsGoalModel } from "../models/savings-goal.model.js";

function currentMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return { start, end };
}

async function sumForUser(
    model: typeof ExpenseModel | typeof IncomeModel | typeof SavingsContributionModel,
    userId: string | undefined,
    dateField: string,
    start: Date,
    end: Date
): Promise<number> {
    const result = await model.aggregate<{ total: number }>([
        { $match: { user: new model.base.Types.ObjectId(userId), [dateField]: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return result[0]?.total ?? 0;
}

export async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { start, end } = currentMonthRange();
        const userId = req.user?.sub;

        const [spentThisMonth, extraIncomeThisMonth, savedThisMonth, budgetResult, savingsResult, recentExpenses] = await Promise.all([
            sumForUser(ExpenseModel, userId, "occurredAt", start, end),
            sumForUser(IncomeModel, userId, "receivedAt", start, end),
            sumForUser(SavingsContributionModel, userId, "contributedAt", start, end),
            BudgetCategoryModel.aggregate<{ total: number }>([
                { $match: { user: new BudgetCategoryModel.base.Types.ObjectId(userId), archivedAt: null } },
                { $group: { _id: null, total: { $sum: "$monthlyLimit" } } },
            ]),
            SavingsGoalModel.aggregate<{ totalSaved: number; totalTarget: number }>([
                { $match: { user: new SavingsGoalModel.base.Types.ObjectId(userId), archivedAt: null } },
                { $group: { _id: null, totalSaved: { $sum: "$savedAmount" }, totalTarget: { $sum: "$targetAmount" } } },
            ]),
            ExpenseModel.find({ user: userId })
                .populate("category", "name monthlyLimit")
                .sort({ occurredAt: -1, _id: -1 })
                .limit(3),
        ]);

        const monthlyBudget = budgetResult[0]?.total ?? 0;
        res.json({
            overview: {
                totalSaved: savingsResult[0]?.totalSaved ?? 0,
                totalSavingsTarget: savingsResult[0]?.totalTarget ?? 0,
                savedThisMonth,
                spentThisMonth,
                extraIncomeThisMonth,
                monthlyBudget,
                remainingBudget: Math.max(0, monthlyBudget - spentThisMonth),
            },
            recentExpenses,
        });
    } catch (error) {
        next(error);
    }
}
