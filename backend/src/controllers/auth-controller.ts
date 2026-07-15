import type { Request, Response, NextFunction } from "express";
import type { AuthLoginUserInputDto, AuthRegisterUserInputDto } from "../schemas/auth-schema.ts";
import { confirmEmailService, resetPasswordService, loginUserService, registerUserService, sendEmailForgotPasswordService, validateTokenService } from "../services/auth-service.ts";
import { AuthLoginOutputDto, AuthPayload } from "../types/auth.ts";
import { jwtGenerateToken } from "../utils/jwt.ts";
import { ENVIROMENTS } from "../env-config.ts";
import { AppError, ERRORS } from "../types/error.ts";
import { email } from "zod";

//Registro de usuario
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

//Login de usuario
export async function loginController(request: Request, response: Response, next: NextFunction) {
    try {
        const dto: AuthLoginUserInputDto = request.body;
        const user = await loginUserService(dto);
        response.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

//Confirmacao de email
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

//Envio de email de recuperacao de senha
export async function sendEmailForgotPasswordController(request: Request, response: Response, next: NextFunction) {
    try {
        const { email } = request.body;

        await sendEmailForgotPasswordService(email);

        return response.status(200).json({ message: "Se houver uma conta será enviado um email de recuperação" });
    } catch (error) {
        next(error);
    }
}

//Envio de email de recuperacao de senha
export async function validateTokenController(request: Request, response: Response, next: NextFunction) {
    try {
        const token = request.query.token as string;

        await validateTokenService(token);

        return response.status(200).json({ message: "Token válido" });
    } catch (error) {
        next(error);
    }
}

//Recuperacao de senha
export async function resetPasswordController(request: Request, response: Response, next: NextFunction) {
    try {
        const { token, newPassword } = request.body;
        await validateTokenService(token);

        await resetPasswordService(token, newPassword);

        return response.status(200).json({ message: "Senha atualizada com sucesso!" });
    } catch (error) {
        next(error);
    }
}