import { NextFunction, Request, Response } from "express";
import { AppError, ERRORS } from "../types/error.ts";
import { jwtVerify } from "../utils/jwt.ts";

export async function authGuard(request: Request, response: Response, next: NextFunction) {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new AppError(ERRORS.unauthorized);
        }
        const [, token] = authHeader.split(" ");

        if (!token) {
            throw new AppError(ERRORS.unauthorized);
        }

        const payload = await jwtVerify(token);
        request.user = payload;
        next();
    } catch (error) {
        next(error);
    }

}
