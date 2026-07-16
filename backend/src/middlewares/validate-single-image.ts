import type { Request, Response, NextFunction } from "express";
import uploadImageSchema from "../schemas/upload-image-schema.ts";
import { AppError, ERRORS } from "../types/error.ts";

export function validateSingleImage(required: boolean) {
    return (request: Request, response: Response, next: NextFunction) => {
        try {
            const file = request.file;

            if (required && !file) {
                throw new AppError(ERRORS.riqueredImageError);
            }

            if (!file) {
                return next();
            }
            
            const result = uploadImageSchema.safeParse(file);
            if (!result.success) {
                throw new AppError({ ...ERRORS.invalidImageTypeError });
            }
            next();
        } catch (error) {
            next(error);
        }
    }
}