import bcrypt from "bcryptjs";
import { createUserRepository, findUserByEmailRepository, updateUserRepository } from "../repositories/user-repository.ts";
import type { RegisterUserDto } from "../schemas/register-user-schema.ts";
import { AppError, ERRORS } from "../types/error.ts";
import { CrateUserOutput } from "../types/user.ts";

//Servico de registro de usuario
export async function registerUserService(dto: RegisterUserDto, avatar?: Express.Multer.File): Promise<CrateUserOutput> {
    const user = await findUserByEmailRepository(dto.email);
    if (user) {
        throw new AppError(ERRORS.emailAlreadyExists);
    }

    const hashPassword = await bcrypt.genSalt(10);
    const userCreated = await createUserRepository({ ...dto, password: hashPassword });

    //TODO: realizar upload de imagem
    
    //TODO: Enviar email de confirmação
    return {
        id: userCreated.id,
        name: userCreated.name,
        email: userCreated.email,
        avatar: userCreated.avatar
    };
}