import bcrypt from "bcryptjs";
import { createUserRepository, findUserByEmailRepository, updateUserRepository } from "../repositories/user-repository.ts";
import type { AuthLoginUserInputDto, AuthRegisterUserInputDto } from "../schemas/auth-schema.ts";
import { AppError, ERRORS } from "../types/error.ts";
import { getStorageFile, uploadStorageFile } from "../providers/s3-storage.ts";
import { UploadOptions } from "../types/upload.ts";
import { ENVIROMENTS } from "../env-config.ts";
import { confirmEmailTemplate } from "../providers/mail/confirm-email-template.ts";
import { sendEmail } from "../providers/mail/node-mail.ts";
import { v4 as uuidv4 } from 'uuid';
import { countEmailConfirmationByUserId, createEmailConfirmationReposytory, deletEmailConfirmationReposytory, findValidEmailConfirmationRepository } from "../repositories/confirmation-email-repository.ts";
import { welcomeTemplate } from "../providers/mail/welcome-template.ts";
import { forgotPasswordTemplate } from "../providers/mail/forgot-password-template.ts";
import { passwordUpdatedTemplate } from "../providers/mail/password-updated-template.ts";
import { AuthLoginOutputDto, AuthPayload } from "../types/auth.ts";
import { jwtGenerateToken } from "../utils/jwt.ts";

//Servico de registro de usuario
export async function registerUserService(dto: AuthRegisterUserInputDto, avatar?: Express.Multer.File): Promise<void> {
    const user = await findUserByEmailRepository(dto.email);
    if (user) {
        throw new AppError(ERRORS.emailAlreadyExists);
    }

    const hashPassword = await bcrypt.hash(dto.password, 10);
    const userCreated = await createUserRepository({ ...dto, password: hashPassword });

    const options: UploadOptions = {
        bucket: ENVIROMENTS.storage.buckets.profiles,
        path: userCreated.id,
        fileName: "avatar"
    };

    if (avatar) {
        const avatarUrl = await uploadStorageFile(options, avatar);
        await updateUserRepository(userCreated.id, { avatar: avatarUrl })
    }

    const confirmationToken = uuidv4();
    await createEmailConfirmationReposytory(userCreated.id, confirmationToken, new Date());
    const confirmationUrl = `${ENVIROMENTS.hosts.api.url}/auth/confirm-email?token=${confirmationToken}`
    const template = confirmEmailTemplate({ name: userCreated.name, confirmationUrl: confirmationUrl });
    await sendEmail({
        to: userCreated.email,
        subject: "Confirmação de email",
        html: template
    });
    return;
}

//Servico de login do usuario
export async function loginUserService(dto: AuthLoginUserInputDto): Promise<AuthLoginOutputDto> {
    const user = await findUserByEmailRepository(dto.email);
    if (!user) {
        throw new AppError(ERRORS.invalidCredentials);
    }

    if (!user.isVerify) {
        throw new AppError(ERRORS.userNotVerified);
    }

    const isValid = await bcrypt.compare(dto.password, user.password);

    if (!isValid) {
        throw new AppError(ERRORS.invalidCredentials);
    }

    const avatar = user.avatar ? await getStorageFile(ENVIROMENTS.storage.buckets.profiles, user.avatar) : null;

    const payload: AuthPayload = {
        id: user.id,
        email: user.email
    }

    const token = await jwtGenerateToken(payload);

    return {
        token: token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: avatar
        }
    };
}

//Servico de confirmacao de email
export async function confirmEmailService(token: string): Promise<void> {
    const emailConfirmation = await findValidEmailConfirmationRepository(token);

    if (!emailConfirmation) {
        throw new AppError(ERRORS.invalidToken);
    }

    await updateUserRepository(emailConfirmation.userid, { isVerify: true });

    deletEmailConfirmationReposytory(emailConfirmation.id);
    const template = welcomeTemplate({
        name: emailConfirmation.user.name,
        loginUrl: ENVIROMENTS.hosts.front.url
    });

    sendEmail({
        to: emailConfirmation.user.email,
        subject: "Boa vindas",
        html: template
    });
    return;
}

//Servico de evio de email para recuperacao de senha
export async function sendEmailForgotPasswordService(email: string): Promise<void> {
    const user = await findUserByEmailRepository(email);
    if (!user || !user.isVerify) {
        return;
    }

    const emailConfirmations = await countEmailConfirmationByUserId(user.id);
    if (emailConfirmations >= 5) {
        console.log("ENtrou");
        throw new AppError(ERRORS.emailRequestLimitExceeded);
    }

    const newtoken = uuidv4();
    await createEmailConfirmationReposytory(user.id, newtoken, new Date());
    const template = forgotPasswordTemplate({
        name: user.name,
        token: newtoken,
        resetPasswordUrl: ENVIROMENTS.hosts.front.url + "/recover-password"
    });

    await sendEmail({
        to: user.email,
        subject: "Recuperaçao de Senha",
        html: template
    });
    return;
}

//Servico de validacao de token 
export async function validateTokenService(token: string): Promise<void> {
    const emailConfirmation = await findValidEmailConfirmationRepository(token);

    if (!emailConfirmation) {
        throw new AppError(ERRORS.invalidToken);
    }
}

//Servico de recuperacao de senha
export async function resetPasswordService(token: string, newPassword: string): Promise<void> {

    const emailConfirmation = await findValidEmailConfirmationRepository(token);
    if (!emailConfirmation) {
        throw new AppError(ERRORS.invalidToken);
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    await updateUserRepository(emailConfirmation.userid, { password: hashPassword });
    await deletEmailConfirmationReposytory(emailConfirmation.id);

    const template = passwordUpdatedTemplate({
        name: emailConfirmation.user.name,
        loginUrl: ENVIROMENTS.hosts.front.url
    });

    sendEmail({
        to: emailConfirmation.user.email,
        subject: "Senha Atualizada",
        html: template
    });
    return;
}
