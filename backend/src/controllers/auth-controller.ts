import type { Request, Response, NextFunction } from "express";
import type { AuthLoginUserInputDto, AuthRegisterUserInputDto } from "../schemas/auth-schema.ts";
import { confirmEmailService, loginUserService, registerUserService } from "../services/auth-service.ts";
import { AuthLoginOutputDto, AuthPayload } from "../types/auth.ts";
import { jwtGenerateToken } from "../utils/jwt.ts";
import { ENVIROMENTS } from "../env-config.ts";
import { AppError, ERRORS } from "../types/error.ts";

export async function registerUserController(request: Request, response: Response, next: NextFunction) {
    try {
        const dto: AuthRegisterUserInputDto = request.body;
        const avatar = request.file;
        await registerUserService(dto, avatar);
        response.status(201).json({ message: "Email de confirmação enviado." });
    } catch (error) {
        next(error);
    }
}

export async function loginController(request: Request, response: Response, next: NextFunction) {
    try {
        const dto: AuthLoginUserInputDto = request.body;
        const user = await loginUserService(dto);

        const payload: AuthPayload = {
            id: user.id,
            email: user.email
        }
        const token = await jwtGenerateToken(payload);
        const data: AuthLoginOutputDto = {
            token: token,
            user: user
        }

        response.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

export async function confirmEmailController(request: Request, response: Response, next: NextFunction) {
    try {
        const { token } = request.query;

        if (typeof token !== "string") {
            throw new AppError({
                code: "invalid_token",
                message: "Token inválido.",
                status: 400,
            });
        }

        await confirmEmailService(token);
        
        return response.render("confirmation", {
            success: true,
            title: "Email confirmado",
            message: "Seu email foi confirmado com sucesso.",
            loginUrl: ENVIROMENTS.hosts.front.url + "/login"
        });
    } catch (error) {
        return response.render("confirmation", {
            success: false,
            title: "Falha na confirmação",
            message: "O token é inválido ou expirou."
        });
    }
}