import type { RequestHandler } from "express";
import { z } from "zod";

export function validateBody<T extends z.ZodType>(
    schema: T
): RequestHandler {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                error: "Validation failed",
                details: z.flattenError(result.error).fieldErrors,
            });
            return;
        }

        req.body = result.data;

        next();
    }
}

export function validateParams<T extends z.ZodType>(schema: T): RequestHandler {
    return (req, res, next) => {
        const result = schema.safeParse(req.params);

        if (!result.success) {
            res.status(400).json({
                error: "Validation failed",
                details: z.flattenError(result.error).fieldErrors,
            });
            return;
        }

        req.params = result.data as typeof req.params;
        next();
    };
}

export function validateQuery<T extends z.ZodType>(schema: T): RequestHandler {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            res.status(400).json({
                error: "Validation failed",
                details: z.flattenError(result.error).fieldErrors,
            });
            return;
        }

        res.locals.validatedQuery = result.data;
        next();
    };
}
