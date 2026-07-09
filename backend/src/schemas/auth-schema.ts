import z from "zod";

export const authRegisterUserSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(6)
});

export const authLoginUserSchema = z.object({
    email: z.email(),
    password: z.string().min(6)
});

export type AuthRegisterUserInputDto = z.infer<typeof authRegisterUserSchema>;

export type AuthLoginUserInputDto = z.infer<typeof authLoginUserSchema>;

