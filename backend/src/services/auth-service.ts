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
import { UserOutputDto } from "../types/user.ts";
import { isValid } from "zod/v3";

//Servico de registro de usuario
export async function registerUserService(dto: AuthRegisterUserInputDto, avatar?: Express.Multer.File): Promise<void> {
    const user = await findUserByEmailRepository(dto.email);
    if (user) {
        throw new AppError(ERRORS.emailAlreadyExists);
    }

    const hashPassword = await bcrypt.hash(dto.password,10);
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
    const confirmationUrl = `${ENVIROMENTS.hosts.api.url}/auth/confirm-email?token=${confirmationToken}`
    const template = confirmEmailTemplate({ name: userCreated.name, confirmationUrl: confirmationUrl });
    await sendEmail({
        to: userCreated.email,
        subject: "Confirmação de email",
        html: template
    });
    return;
}

export async function loginUserService(dto: AuthLoginUserInputDto): Promise<UserOutputDto> {
    const userdb = await findUserByEmailRepository(dto.email);
    if (!userdb) {
        throw new AppError(ERRORS.invalidCredentials);
    }

    if (!userdb.isVerify) {
        throw new AppError(ERRORS.userNotVerified);
    }

    console.log(userdb)
    const isValid = await bcrypt.compare(dto.password, userdb.password);
    console.log(isValid)

    if (!isValid) {
        throw new AppError(ERRORS.invalidCredentials);
    }

    const avatar = userdb.avatar ? await getStorageFile(ENVIROMENTS.storage.buckets.profiles, userdb.avatar) : null;

    return {
        id: userdb.id,
        name: userdb.name,
        email: userdb.email,
        avatar: avatar
    };
}