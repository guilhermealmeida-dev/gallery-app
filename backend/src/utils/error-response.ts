import type { ErrorType } from "../types/error.ts";
import type { Response } from "express";

export function errorResponse(error: ErrorType, response: Response) {
    response.status(error.status).json({
        error: {
            code: error.code,
            message: error.message,
            details: error.details
        }
    })
}