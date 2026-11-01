import { UserModel } from "../models/user.model.js";
import type { RequestHandler } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/app-error.js";
import jwt from "jsonwebtoken";
import { SessionModel } from "../models/session.model.js";


export const authenticate: RequestHandler = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError(401, "Authentication required.");
        }
        
        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new AppError(401, "Authentication required.");
        }

        const payload = verifyAccessToken(token);

        const user = await UserModel.findById(payload.sub);

        if (!user || user.accountStatus !== "active") {
            throw new AppError(401, "Your session is no longer valid.");
        }

        const session = await SessionModel.findOne({
            _id: payload.sid,
            user: payload.sub,
            revokedAt: null,
            expiresAt: { $gt: new Date() },
            absoluteExpiresAt: { $gt: new Date() }
        });

        if (!session) {
            throw new AppError(401, "Your session is no longer valid.");
        }

        if (!user.emailVerified) {
            throw new AppError(403, "Please verify your email address.");
        }

        req.user = payload;

        next();

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AppError(401, "Invalid or expired access token."));
            return;
        }

        next(error);
    }
}