import { UserOutputDto } from "./user.ts"

export type AuthLoginOutputDto = {
    token: string,
    user: UserOutputDto
}


export type AuthPayload = {
    id: string,
    email: string
}
