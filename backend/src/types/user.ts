import { AlbunsOutputDto } from "./albums.ts"

export type UserOutputDto = {
    id: string,
    name: string,
    email: string
    albuns: AlbunsOutputDto[]
}