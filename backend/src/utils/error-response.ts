
import type { Response } from "express";
import { AppError } from "../types/error.ts";

export function errorResponse(error: AppError, response: Response) {
    response.status(error.status).json({
        error: {
            code: error.code,
            message: error.message,
            details: error.details
        }
    })
}