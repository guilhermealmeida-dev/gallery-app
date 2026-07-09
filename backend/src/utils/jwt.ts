import jwt from "jsonwebtoken";
import { ENVIROMENTS } from "../env-config.ts";
export async function jwtGenerateToken(object: any): Promise<string> {
    return jwt.sign(object, ENVIROMENTS.secretesKeys.jwtSecreteKey);
}