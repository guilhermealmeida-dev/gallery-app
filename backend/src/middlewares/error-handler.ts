import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, ERRORS } from "../types/error.ts";
import { errorResponse } from "../utils/error-response.ts";
import jwt from "jsonwebtoken";

export function errorHandler(
    error: unknown,
    request: Request,
    response: Response,
    next: NextFunction
) {
    if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
            code: issue.code,
        }));

        return errorResponse(
            new AppError({ ...ERRORS.bodyValidatorError, details }),
            response
        );
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
        return errorResponse(new AppError(ERRORS.invalidToken), response);
    }

    if (error instanceof SyntaxError) {
        return errorResponse(new AppError(ERRORS.syntaxeJsonError), response);
    }

    if (error instanceof AppError) {
        return errorResponse(error, response);
    }

    return errorResponse(new AppError(ERRORS.internalServerError), response);
}