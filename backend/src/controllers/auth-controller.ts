import type { Request, Response, NextFunction } from "express";
import type { RegisterUserDto } from "../schemas/register-user-schema.ts";

export async function registerUserController(request: Request, response: Response, next: NextFunction) {
    try {
        const dto: RegisterUserDto = request.body;
        //TODO: implementar servico de registro de usuário
        response.status(201).json({ message: "Emeil de confirmação enviado." });
    } catch (error) {
        next(error);
    }
}