import { z } from "zod";

const uploadImageSchema = z
  .object({
    buffer: z.instanceof(Buffer),
    mimetype: z.string(),
    size: z.number()
  })
  .refine(
    (file) =>
      ["image/jpeg", "image/png"].includes(file.mimetype),
    {
      message: "A imagem deve ser um arquivo PNG ou JPG"
    }
  ).nullish();

export default uploadImageSchema;