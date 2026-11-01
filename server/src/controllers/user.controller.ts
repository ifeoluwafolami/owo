import type { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";
import type { UpdateProfileInput } from "../validators/users.validators.js";

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = await UserModel.findOneAndUpdate(
            { _id: req.user?.sub, accountStatus: "active" },
            { $set: req.body as UpdateProfileInput },
            { new: true, runValidators: true }
        );
        if (!user) throw new AppError(404, "User not found.");

        res.json({
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                birthday: user.birthday,
                monthlyIncome: user.monthlyIncome,
                preferences: user.preferences,
                onboardingCompleted: user.onboardingCompleted,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function completeOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = await UserModel.findOneAndUpdate(
            { _id: req.user?.sub, accountStatus: "active" },
            { $set: { ...req.body, onboardingCompleted: true } },
            { new: true, runValidators: true }
        );
        if (!user) throw new AppError(404, "User not found.");
        res.json({ message: "Onboarding completed.", onboardingCompleted: true });
    } catch (error) {
        next(error);
    }
}
