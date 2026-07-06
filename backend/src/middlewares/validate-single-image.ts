import type { Request, Response, NextFunction } from "express";
import uploadImageSchema from "../schemas/upload-image-schema.ts";

export function validateSingleImage() {
    return (request: Request, response: Response, next: NextFunction) => {
        try {
            const file = request.file;
            uploadImageSchema.parse(file);
            next();
        } catch (error) {
            next(error);
        }
    }
}