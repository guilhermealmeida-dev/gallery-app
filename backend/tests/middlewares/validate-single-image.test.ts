import { describe, it, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import { upload } from "../../src/utils/upload.ts";
import { validateSingleImage } from "../../src/middlewares/validate-single-image.js";

const app = express();

app.post(
    "/upload",
    upload.single("avatar"),
    validateSingleImage(),
    (req, res) => {

        res.status(200).json({
            nomeArquivo: req.file?.originalname
        });

    }
);


describe("Middleware de upload", () => {
    it("deve aceitar uma imagem válida", async () => {

        const response = await request(app)
            .post("/upload")
            .attach(
                "avatar",
                Buffer.from("imagem-falsa"),
                {
                    filename: "avatar.png",
                    contentType: "image/png"
                }
            );


        expect(response.status)
            .toBe(200);


        expect(response.body)
            .toEqual({
                nomeArquivo: "avatar.png"
            });

    });

    it("deve rejeitar um formato de imagem inválido", async () => {

        const response = await request(app)
            .post("/upload")
            .attach(
                "avatar",
                Buffer.from("arquivo-texto"),
                {
                    filename: "arquivo.txt",
                    contentType: "text/plain"
                }
            );


        expect(response.status)
            .toBe(400);

    });
});