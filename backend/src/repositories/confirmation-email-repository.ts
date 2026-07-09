import { prisma } from "../providers/prisma-client.ts";

export async function findEmailConfirmationRepository(token: string) {
    return await prisma.emailConfirmation.findUnique({
        where: { token: token }, include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    })
}

export async function createEmailConfirmationReposytory(userId: string, token: string) {
    return await prisma.emailConfirmation.create({ data: { userid: userId, token: token } })
}

export async function deletEmailConfirmationReposytory(id: string) {
    return await prisma.emailConfirmation.delete({ where: { id: id } })
}