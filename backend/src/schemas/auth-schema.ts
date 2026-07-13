import z from "zod";

export const authRegisterUserSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(6)
});
export type AuthRegisterUserInputDto = z.infer<typeof authRegisterUserSchema>;


export const authLoginUserSchema = z.object({
    email: z.email(),
    password: z.string().min(6)
});
export type AuthLoginUserInputDto = z.infer<typeof authLoginUserSchema>;


export const authEmailUserSchema = z.object({
    email: z.email()
});
export type AuthEmailUserInputDto = z.infer<typeof authEmailUserSchema>;


export const authResetPasswordSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(6)
});
export type AuthRestePasswordSchemaInputDto = z.infer<typeof authResetPasswordSchema>;