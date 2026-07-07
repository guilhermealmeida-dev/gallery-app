import bcrypt from "bcryptjs";
import { createUserRepository, findUserByEmailRepository, updateUserRepository } from "../repositories/user-repository.ts";
import type { RegisterUserDto } from "../schemas/register-user-schema.ts";
import { AppError, ERRORS } from "../types/error.ts";
import { uploadStorageFile } from "../providers/s3-storage.ts";
import { UploadOptions } from "../types/upload.ts";
import { ENVIROMENTS } from "../env-config.ts";

//Servico de registro de usuario
export async function registerUserService(dto: RegisterUserDto, avatar?: Express.Multer.File): Promise<void> {
    const user = await findUserByEmailRepository(dto.email);
    if (user) {
        throw new AppError(ERRORS.emailAlreadyExists);
    }

    const hashPassword = await bcrypt.genSalt(10);
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

    //TODO: Enviar email de confirmação
    return;
}