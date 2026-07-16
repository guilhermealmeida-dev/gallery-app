import { UserCreateInput, UserUpdateInput } from "../../generated/prisma/models.ts";
import { prisma } from "../providers/prisma-client.ts";

//Busca usuurio pelo email
export async function findUserByEmailRepository(email: string) {
    return prisma.user.findUnique({
        where: { email: email }
    });
}

//Busca usuurio pelo email
export async function findUserByIdRepository(id: string) {
    return prisma.user.findUnique({
        where: { id: id }
    });
}

//Cria um usuario
export async function createUserRepository(data: UserCreateInput) {
    return prisma.user.create({
        data
    });
}

export async function updateUserRepository(userId: string, data: UserUpdateInput) {
    return prisma.user.update({
        where: {
            id: userId
        },
        include: {
            albums: true
        },
        data: data
    })
}