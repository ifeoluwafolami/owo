import { rateLimit } from "express-rate-limit"

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, /* 15 minute window */
    limit: 100, /* number of requests in that window */
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Too many requests",
        message: "Please try again later.",
    },
});