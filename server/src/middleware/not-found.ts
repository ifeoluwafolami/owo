import type { Request, Response, NextFunction } from "express";

export function notFoundHandler(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    res.status(404).json({
        error: "Not Found",
        message: `Route ${req.method} ${req.originalUrl} was not found.`
    });
}