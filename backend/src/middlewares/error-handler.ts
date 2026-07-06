import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, ERRORS } from "../types/error.ts";
import { errorResponse } from "../utils/error-response.ts";

export function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {

    if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
            code: issue.code,
        }));

        const erro: AppError = { ...ERRORS.bodyValidatorError, details };
        errorResponse(erro, response);
    }

    if (error instanceof SyntaxError) {
        const erro = ERRORS.syntaxeJsonError;
        errorResponse(erro, response);
    }

    if (error instanceof AppError) {
        errorResponse(error, response);
    }

    errorResponse(ERRORS.internalServerError, response);
}