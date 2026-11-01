import type { ErrorRequestHandler } from "express";
import { config } from "../config/config.js";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = (
    err,
    _req,
    res,
    next
) => {
    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
        });
        return;
    }
    
    console.error(err);

    res.status(500).json({
        error: "Internal Server Error",
        message:
            config.nodeEnv === "development" && err instanceof Error
                ? err.message
                : "Something went wrong. Please try again later."
    });
};