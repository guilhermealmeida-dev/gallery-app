import z from "zod";

export const registerUserSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(6)
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;