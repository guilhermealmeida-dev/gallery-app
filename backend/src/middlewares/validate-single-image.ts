import type { Request, Response, NextFunction } from "express";
import uploadImageSchema from "../schemas/upload-image-schema.ts";
import { ERRORS } from "../types/error.ts";

export function validateSingleImage() {
    return (request: Request, response: Response, next: NextFunction) => {
        try {
            const file = request.file;
            const result = uploadImageSchema.safeParse(file);
            if (!result.success) {
                throw ERRORS.bodyValidatorError;;
            }
            next();
        } catch (error) {
            next(error);
        }
    }
}