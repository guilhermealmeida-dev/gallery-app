import type { Request, Response, NextFunction } from "express";
import type { RegisterUserDto } from "../schemas/register-user-schema.ts";
import { registerUserService } from "../services/auth-service.ts";
// import { registerUserService } from "../services/auth-service.ts";

export async function registerUserController(request: Request, response: Response, next: NextFunction) {
    try {
        const dto: RegisterUserDto = request.body;
        const avatar=request.file;
        await registerUserService(dto,avatar);
        response.status(201).json({ message: "Emeil de confirmação enviado." });
    } catch (error) {
        next(error);
    }
}