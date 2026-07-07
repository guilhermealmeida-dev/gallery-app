export type CrateUserOutput = {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
}

export type UpdateUser = {
    avatar?: string, 
    passwoer?: string
}