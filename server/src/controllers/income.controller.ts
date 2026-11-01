import type { NextFunction, Request, Response } from "express";
import { IncomeModel } from "../models/income.model.js";
import { AppError } from "../utils/app-error.js";
import type { CreateIncomeInput, ListQuery, UpdateIncomeInput } from "../validators/finance.validators.js";

export async function listIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const query = res.locals.validatedQuery as ListQuery;
        const range: Record<string, Date> = {};
        if (query.from) range.$gte = query.from;
        if (query.to) range.$lte = query.to;
        if (query.cursor) range.$lt = query.cursor;

        const income = await IncomeModel.find({
            user: req.user?.sub,
            ...(Object.keys(range).length ? { receivedAt: range } : {}),
        }).sort({ receivedAt: -1, _id: -1 }).limit(query.limit);

        res.json({
            income,
            nextCursor: income.length === query.limit
                ? income.at(-1)?.receivedAt.toISOString() ?? null
                : null,
        });
    } catch (error) {
        next(error);
    }
}

export async function createIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const income = await IncomeModel.create({
            ...(req.body as CreateIncomeInput),
            user: req.user?.sub,
        });
        res.status(201).json({ income });
    } catch (error) {
        next(error);
    }
}

export async function updateIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const income = await IncomeModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user?.sub },
            { $set: req.body as UpdateIncomeInput },
            { new: true, runValidators: true }
        );
        if (!income) throw new AppError(404, "Income entry not found.");
        res.json({ income });
    } catch (error) {
        next(error);
    }
}

export async function deleteIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const income = await IncomeModel.findOneAndDelete({ _id: req.params.id, user: req.user?.sub });
        if (!income) throw new AppError(404, "Income entry not found.");
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
