import jwt, { JwtPayload } from "jsonwebtoken";
import { ENVIROMENTS } from "../env-config.ts";
import { AuthPayload } from "../types/auth.ts";

export async function jwtGenerateToken(object: any): Promise<string> {
    return jwt.sign(object, ENVIROMENTS.secretesKeys.jwtSecreteKey);
}

export async function jwtVerify(token: string) {
    const payload = jwt.verify(token, ENVIROMENTS.secretesKeys.jwtSecreteKey) as JwtPayload;
    return {
        id: payload.id,
        email: payload.email
    }
}

export async function jwtdecode(token: string): Promise<AuthPayload> {
    const payload = jwt.decode(token) as AuthPayload;
    return {
        id: payload.id,
        email: payload.email
    }
}