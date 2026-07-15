import { NextFunction, Request, Response } from "express";
import { getUserService } from "../services/user-service.ts";

export async function getUserController(request: Request, response: Response, next: NextFunction) {
    try {
        const user = await getUserService(request.user.id);
        response.status(200).json(user);
    } catch (error) {
        next(error);
    }
}