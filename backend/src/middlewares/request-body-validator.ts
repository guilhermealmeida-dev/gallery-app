import type { Request, Response, NextFunction } from "express";
import type { ZodObject } from "zod";

export function requestBodyValidator(shema: ZodObject) {
    return (request: Request, response: Response, next: NextFunction)=>{
        try {
            const object = request.body;
            const shemaParse=shema.parse(object);
            request.body=shemaParse;
            next();
        } catch (error) {
            next(error);
        }
    }
}