import { Types } from "mongoose";
import { SessionModel } from "../models/session.model.js";
import { generateRefreshToken, hashRefreshToken } from "../utils/refresh-token.js";

interface CreateSessionInput {
    userId: string;
    userAgent?: string;
    ipAddress?: string;
}

export async function createSession({
    userId, userAgent, ipAddress,
}: CreateSessionInput) {
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const now = new Date();

    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const absoluteExpiresAt = new Date(now);
    absoluteExpiresAt.setDate(absoluteExpiresAt.getDate() + 90)

    const session = await SessionModel.create({
        user: new Types.ObjectId(userId),
        refreshTokenHash,
        expiresAt,
        absoluteExpiresAt,
        userAgent,
        ipAddress,
        lastUsedAt: now,
    });

    return {
        session,
        refreshToken,
    };
}