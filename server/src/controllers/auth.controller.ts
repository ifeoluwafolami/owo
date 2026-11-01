import type { Request, Response, NextFunction } from "express";

import { UserModel } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { AppError } from "../utils/app-error.js";
import type { SignupInput, VerifyEmailInput, ResendVerificationInput, LoginInput } from "../validators/auth.validators.js";
import { generateSecureToken, hashToken } from "../utils/token.js";

import { EMAIL_VERIFICATION_EXPIRY } from "../config/constants.js";
import { sendVerificationEmail } from "../services/email.service.js";
import { generateAccessToken } from "../utils/jwt.js";
import { createSession } from "../services/session.service.js";
import { config } from "../config/config.js";

import { SessionModel } from "../models/session.model.js";
import { generateRefreshToken, hashRefreshToken } from "../utils/refresh-token.js";


export async function signup(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
        } = req.body as SignupInput;

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            throw new AppError(
                409,
                "An account with this email already exists."
            );
        }

        const passwordHash = await hashPassword(password);

        const verificationToken = generateSecureToken();

        const verificationTokenHash = hashToken(verificationToken);

        const verificationExpiresAt = new Date(
            Date.now() + EMAIL_VERIFICATION_EXPIRY
        );

        const user = await UserModel.create({
            firstName,
            lastName,
            email,
            passwordHash,
            emailVerificationTokenHash: verificationTokenHash,
            emailVerificationExpiresAt: verificationExpiresAt,
        });

        let verificationEmailSent = true;

        try {
            await sendVerificationEmail(
                email,
                verificationToken,
                firstName
            );
        } catch (emailError) {
            verificationEmailSent = false;
            console.error("Failed to send verification emaill:", emailError);
        }

        res.status(201).json({
            message: verificationEmailSent
                ? "Account created. Please check your email to verify your account."
                : "Account created, but we couldn't send your verification email. Please request another.",
            verificationEmailSent,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                preferences: user.preferences,
                onboardingCompleted: user.onboardingCompleted,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            },
        });

    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            next(
                new AppError(
                    409,
                    "An account with this email already exists."
                )
            );
            return;
        }

        next(error);
    }
}

export async function verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { token } = req.body as VerifyEmailInput;

        const tokenHash = hashToken(token);

        const user = await UserModel.findOneAndUpdate(
            {
                emailVerificationTokenHash: tokenHash,
                emailVerificationExpiresAt: { $gt: new Date() },
                emailVerified: false,
            },
            {
                $set: { emailVerified: true },
                $unset: {
                    emailVerificationTokenHash: "",
                    emailVerificationExpiresAt: "",
                },
            },
            {
                new: true,
            }
        );

        if (!user) {
            throw new AppError(
                400,
                "This verification link is invalid or has expired."
            );
        }

        res.status(200).json({
            message: "Your email address has been verified successfully.",
            emailVerified: user.emailVerified,
        });
    } catch (error) {
        next(error);
    }
}

export async function resendVerificationEmail(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { email } = req.body as ResendVerificationInput;

        const user = await UserModel.findOne({
            email,
            emailVerified: false,
            accountStatus: "active",
        });

        const genericResponse = {
            message: "If an unverified account exists for this email, a verification link will be sent.",
        };

        if (!user) {
            res.status(200).json(genericResponse);
            return;
        }

        const verificationToken = generateSecureToken();

        user.emailVerificationTokenHash = hashToken(verificationToken);

        user.emailVerificationExpiresAt = new Date(
            Date.now() + EMAIL_VERIFICATION_EXPIRY
        );

        await user.save();

        try {
            await sendVerificationEmail(
                user.email,
                verificationToken,
                user.firstName
            );
        } catch (emailError) {
            console.error("Failed to resend verification email:", emailError);
        }

        res.status(200).json(genericResponse);
    } catch (error) {
        next(error);
    }
}

export async function login(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { email, password } = req.body as LoginInput;
        
        const user = await UserModel.findOne({ email }).select("+passwordHash");

        if (!user) {
            throw new AppError(401, "Invalid email or password.");
        }

        const isPasswordCorrect = await comparePassword(password, user.passwordHash);

        if (!isPasswordCorrect) {
            throw new AppError(401, "Invalid email or password.");
        }

        if (user.accountStatus !== "active") {
            throw new AppError(
                403, "Your account is currently disabled."
            );
        }

        if (!user.emailVerified) {
            throw new AppError(
                403, "Please verify your email address before logging in."
            );
        }

        const { session, refreshToken } = await createSession({
            userId: user._id.toString(),
            userAgent: req.get("user-agent"),
            ipAddress: req.ip,
        });

        const accessToken = generateAccessToken(user._id.toString(), user.role, session._id.toString());

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: "/api/auth",
        });

        res.status(200).json({
            message: "Login successful.",
            accessToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function getMe(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = await UserModel.findById(req.user?.sub);

        if (!user) {
            throw new AppError(404, "User not found.");
        }

        res.status(200).json({
            message: "Profile retrieved successfully.",
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
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function refresh(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new AppError(401, "Authentication required.");
        }

        const refreshTokenHash = hashRefreshToken(refreshToken);

        const session = await SessionModel.findOne({
            refreshTokenHash,
            revokedAt: null,
            expiresAt: { $gt: new Date() },
            absoluteExpiresAt: { $gt: new Date() },
        })
        .select("+refreshTokenHash +usedRefreshTokenHashes");

        if (!session) {
            const reusedTokenSession = await SessionModel.findOne({
                usedRefreshTokenHashes: refreshTokenHash,
            }).select("+usedRefreshTokenHashes");

            if (reusedTokenSession) {
                await SessionModel.findOneAndUpdate(
                    {
                        _id: reusedTokenSession._id,
                        revokedAt: null,
                    },
                    {
                        $set: { revokedAt: new Date() },
                    }
                );
            }

            throw new AppError(401, "Invalid or expired refresh token.");
        }

        const user = await UserModel.findById(session.user);

        if (!user || user.accountStatus !== "active") {
            session.revokedAt = new Date();
            await session.save();

            throw new AppError(401, "Your session is no longer valid.");
        }

        if (!user.emailVerified) {
            session.revokedAt = new Date();
            await session.save();

            throw new AppError(403, "Please verify your email address.");
        }

        const newRefreshToken = generateRefreshToken();
        const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

        const now = new Date();

        const newExpiresAt = new Date(now);
        newExpiresAt.setDate(newExpiresAt.getDate() + 30);

        if (newExpiresAt > session.absoluteExpiresAt) {
            newExpiresAt.setTime(session.absoluteExpiresAt.getTime());
        }

        const updatedSession = await SessionModel.findOneAndUpdate(
            {
                _id: session._id,
                refreshTokenHash,
                revokedAt: null,
                expiresAt: { $gt: now },
                absoluteExpiresAt: { $gt: now },
            },
            {
                $set: {
                    refreshTokenHash: newRefreshTokenHash,
                    expiresAt: newExpiresAt,
                    lastUsedAt: now,
                },
                $addToSet: {
                    usedRefreshTokenHashes: refreshTokenHash,
                },
            },
            { new: true }
        );

        if (!updatedSession) {
            const reusedTokenSession = await SessionModel.findOne({
                usedRefreshTokenHashes: refreshTokenHash,
            }).select("+usedRefreshTokenHashes");

            if (reusedTokenSession) {
                await SessionModel.findOneAndUpdate(
                    {
                        _id: reusedTokenSession._id,
                        revokedAt: null,
                    },
                    {
                        $set: { revokedAt: new Date() },
                    }
                );
            }

            throw new AppError(401, "Invalid or expired refresh token.");
        }

        const accessToken = generateAccessToken(
            user._id.toString(),
            user.role,
            session._id.toString()
        );

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: "lax",
            maxAge: Math.max(0, newExpiresAt.getTime() - now.getTime()),
            path: "/api/auth",
        });

        res.status(200).json({
            message: "Token refreshed successfully.",
            accessToken,
        });

    } catch (error) {
        next(error);   
    }
}

export async function logout(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const sessionId = req.user?.sid;

        if (!sessionId) {
            throw new AppError(401, "Authentication required.");
        }

        await SessionModel.findOneAndUpdate(
            {
                _id: sessionId,
                user: req.user?.sub,
                revokedAt: null,
            },
            {
                $set: {
                    revokedAt: new Date(),
                },
            }
        );

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: "lax",
            path: "/api/auth",
        });

        res.status(200).json({
            message: "Logout successful.",
        });
    } catch (error) {
        next(error);
    }
}

export async function logoutAll(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user?.sub;

        if (!userId) {
            throw new AppError(401, "Authentication required.");
        }

        await SessionModel.updateMany(
            {
                user: userId,
                revokedAt: null,
            },
            {
                $set: {
                    revokedAt: new Date(),
                },
            }
        );

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: "lax",
            path: "/api/auth",
        });

        res.status(200).json({
            message: "Successfully logged out of all devices.",
        });
    } catch (error) {
        next(error);
    }
}