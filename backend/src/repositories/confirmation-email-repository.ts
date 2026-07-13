import { prisma } from "../providers/prisma-client.ts";

export async function findValidEmailConfirmationRepository(token: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const emailConfirmation = await prisma.emailConfirmation.findUnique({
        where: {
            token,
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (!emailConfirmation) {
        return null;
    }

    const lastEmailConfirmation = await prisma.emailConfirmation.findFirst({
        where: {
            userid: emailConfirmation.userid,
            date: {
                gte: start,
                lte: end,
            },
        },
        orderBy: {
            date: "desc",
        },
    });

    if (!lastEmailConfirmation || lastEmailConfirmation.token !== token) {
        return null;
    }

    return emailConfirmation;
}

export async function createEmailConfirmationReposytory(userId: string, token: string, date: Date) {
    return await prisma.emailConfirmation.create({ data: { userid: userId, token: token, date: date } })
}

export async function countEmailConfirmationByUserId(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return await prisma.emailConfirmation.count({
        where: {
            userid: userId,
            date: {
                gte: start,
                lte: end,
            }
        }
    });
}

export async function deletEmailConfirmationReposytory(id: string) {
    return await prisma.emailConfirmation.delete({ where: { id: id } })
}