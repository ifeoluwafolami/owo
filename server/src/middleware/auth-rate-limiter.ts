import { rateLimit } from "express-rate-limit";

export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Too many signup attempts. Please try again later.",
    },
});

export const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Too many login attempts. Please try again later.",
    },
});

export const verifyEmailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Too many email verification attempts. Please try again later.",
    },
});

export const resendVerificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Too many email verification requests. Please try again later.",
    },
});