export type AuthLoginOutputDto = {
    token: string,
    user: {
        id: string,
        name: string,
        email: string
        avatar?: Buffer | null,
    }
}

export type AuthPayload = {
    id: string,
    email: string
}
