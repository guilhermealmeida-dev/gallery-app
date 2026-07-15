import { findUserByIdRepository } from "../repositories/user-repository.ts"
import { AppError, ERRORS } from "../types/error.ts";
import { UserOutputDto } from "../types/user.ts"

export async function getUserService(id: string): Promise<UserOutputDto> {
    const userDb = await findUserByIdRepository(id);
    if (!userDb) {
        throw new AppError(ERRORS.notfoundUser);
    }
    
    return {
        id: userDb.id,
        email: userDb.email,
        name: userDb.name
    };
}