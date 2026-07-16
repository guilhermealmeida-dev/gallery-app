import { NextFunction, Request, Response } from "express";
import { getUserService, updateUserAvatarService, updateUserService } from "../services/user-service.ts";

export async function getUserController(request: Request, response: Response, next: NextFunction) {
    try {
        const user = await getUserService(request.user.id);
        response.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

export async function updateUserController(request: Request, response: Response, next: NextFunction) {
    try {
        const userId = request.user.id;
        const data = request.body;
        const user = await updateUserService(userId, data);
        response.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

export async function updateUserAvatarController(request: Request, response: Response, next: NextFunction) {
    try {
        const userId = request.user.id;
        const file = request.file!;
        const avatar = await updateUserAvatarService(userId, file);
        response.status(200).json({ avatar: avatar });
    } catch (error) {
        next(error);
    }
}