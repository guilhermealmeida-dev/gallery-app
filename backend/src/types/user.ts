export type UpdateUser = {
    avatar?: string,
    password?: string,
    isVerify?: boolean
}

export type UserOutputDto={
    id:string,
    name:string,
    email:string
}