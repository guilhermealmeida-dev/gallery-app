import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { ENVIROMENTS } from "../env-config.ts";
import dotenv from "dotenv";
dotenv.config();

const adapter= new PrismaPg({
    connectionString: ENVIROMENTS.database.url!,
})

export const prisma = new PrismaClient({adapter});