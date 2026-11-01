import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export interface AccessTokenPayload {
    sub: string;
    sid: string;
    role: "user" | "admin";
    iat: number;
    exp: number;
}

export function generateAccessToken(
    userId: string,
    role: AccessTokenPayload["role"],
    sessionId: string
): string {
    return jwt.sign(
        {
            role, sid: sessionId
        },
        config.jwt.accessSecret,
        {
            subject: userId,
            expiresIn: config.jwt.accessExpiry as jwt.SignOptions["expiresIn"],
            algorithm: "HS256",
        }
    );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, config.jwt.accessSecret, {
        algorithms: ["HS256"],
    });

    if (
        typeof decoded === "string" ||
        typeof decoded.sub !== "string" ||
        typeof decoded.sid !== "string" ||
        (decoded.role !== "user" && decoded.role !== "admin") ||
        typeof decoded.iat !== "number" ||
        typeof decoded.exp !== "number"
    ) {
        throw new Error("Invalid access token payload");
    }

    return decoded as AccessTokenPayload;
}