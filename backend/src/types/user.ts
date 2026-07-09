export type UpdateUser = {
    avatar?: string,
    passwoer?: string
}

export type UserOutputDto = {
    id: string,
    name: string,
    email: string
    avatar?: Buffer | null,
}