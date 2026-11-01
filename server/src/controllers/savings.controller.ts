import type { NextFunction, Request, Response } from "express";
import { SavingsContributionModel } from "../models/savings-contribution.model.js";
import { SavingsGoalModel } from "../models/savings-goal.model.js";
import { AppError } from "../utils/app-error.js";
import type {
    CreateSavingsContributionInput,
    CreateSavingsGoalInput,
    ListQuery,
    UpdateSavingsGoalInput,
} from "../validators/finance.validators.js";

export async function listSavingsGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const goals = await SavingsGoalModel.find({ user: req.user?.sub, archivedAt: null })
            .sort({ createdAt: -1 });
        res.json({ goals });
    } catch (error) {
        next(error);
    }
}

export async function createSavingsGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const goal = await SavingsGoalModel.create({
            ...(req.body as CreateSavingsGoalInput),
            user: req.user?.sub,
        });
        res.status(201).json({ goal });
    } catch (error) {
        next(error);
    }
}

export async function updateSavingsGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const goal = await SavingsGoalModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user?.sub, archivedAt: null },
            { $set: req.body as UpdateSavingsGoalInput },
            { new: true, runValidators: true }
        );
        if (!goal) throw new AppError(404, "Savings goal not found.");
        res.json({ goal });
    } catch (error) {
        next(error);
    }
}

export async function archiveSavingsGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const goal = await SavingsGoalModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user?.sub, archivedAt: null },
            { $set: { archivedAt: new Date() } },
            { new: true }
        );
        if (!goal) throw new AppError(404, "Savings goal not found.");
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function listSavingsContributions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const query = res.locals.validatedQuery as ListQuery;
        const range: Record<string, Date> = {};
        if (query.from) range.$gte = query.from;
        if (query.to) range.$lte = query.to;
        if (query.cursor) range.$lt = query.cursor;

        const contributions = await SavingsContributionModel.find({
            user: req.user?.sub,
            ...(Object.keys(range).length ? { contributedAt: range } : {}),
        })
            .populate("goal", "title")
            .sort({ contributedAt: -1, _id: -1 })
            .limit(query.limit);

        res.json({
            contributions,
            nextCursor: contributions.length === query.limit
                ? contributions.at(-1)?.contributedAt.toISOString() ?? null
                : null,
        });
    } catch (error) {
        next(error);
    }
}

export async function createSavingsContribution(req: Request, res: Response, next: NextFunction): Promise<void> {
    const input = req.body as CreateSavingsContributionInput;
    let goalUpdated = false;

    try {
        const goal = await SavingsGoalModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user?.sub, archivedAt: null },
            { $inc: { savedAmount: input.amount } },
            { new: true, runValidators: true }
        );
        if (!goal) throw new AppError(404, "Savings goal not found.");
        goalUpdated = true;

        const contribution = await SavingsContributionModel.create({
            ...input,
            goal: goal._id,
            user: req.user?.sub,
        });
        await contribution.populate("goal", "title");
        res.status(201).json({ contribution, goal });
    } catch (error) {
        if (goalUpdated) {
            await SavingsGoalModel.updateOne(
                { _id: req.params.id, user: req.user?.sub },
                { $inc: { savedAmount: -input.amount } }
            ).catch(() => undefined);
        }
        next(error);
    }
}
