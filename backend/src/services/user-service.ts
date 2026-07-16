import bcrypt from "bcryptjs";
import { ENVIROMENTS } from "../env-config.ts";
import { getStorageFile, uploadStorageFile } from "../providers/s3-storage.ts";
import { findUserByIdRepository, updateUserRepository } from "../repositories/user-repository.ts"
import { UserUpdateInputDto } from "../schemas/user.schema.ts";
import { AppError, ERRORS } from "../types/error.ts";
import { UploadOptions } from "../types/upload.ts";
import { UserOutputDto } from "../types/user.ts"
import { UserUpdateInput } from "../../generated/prisma/models.ts";

export async function getUserService(id: string): Promise<UserOutputDto> {
    const userDb = await findUserByIdRepository(id);
    if (!userDb) {
        throw new AppError(ERRORS.notfoundUser);
    }

    return {
        id: userDb.id,
        email: userDb.email,
        name: userDb.name,
        albuns: [] // TODO: atualizar corretamente
    };
}

export async function updateUserService(id: string, data: UserUpdateInputDto): Promise<UserOutputDto> {
    const userDb = await findUserByIdRepository(id);

    if (!userDb) {
        throw new AppError(ERRORS.notfoundUser);
    }

    const updateData: UserUpdateInput = {};

    if (data.name !== undefined) {
        updateData.name = data.name;
    }

    if (data.password !== undefined) {
        updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await updateUserRepository(id, updateData);

    return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        albuns: updatedUser.albums
    };
}

export async function updateUserAvatarService(id: string, avatar: Express.Multer.File): Promise<Buffer> {
    const userDb = await findUserByIdRepository(id);

    if (!userDb) {
        throw new AppError(ERRORS.notfoundUser);
    }

    const options: UploadOptions = {
        bucket: ENVIROMENTS.storage.buckets.profiles,
        path: id,
        fileName: "avatar"
    };

    const avatarPath = await uploadStorageFile(options, avatar);

    await updateUserRepository(id, {
        avatar: avatarPath
    });

    return await getStorageFile(ENVIROMENTS.storage.buckets.profiles, avatarPath);
}