import z from "zod";

export const userUpdateSchema = z.object({
    name: z.string().optional(),
    password: z.string().min(6).optional(),
});
export type UserUpdateInputDto = z.infer<typeof userUpdateSchema>;