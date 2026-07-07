import "dotenv/config";

import {
    CreateBucketCommand,
    DeleteBucketCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";

import {
    createBucket,
    deletBucket,
    getStorageFile,
    getStorageFileUrl,
    uploadStorageFile
} from "../../src/providers/s3-storage.js";

import { ENVIROMENTS } from "../../src/env-config.ts";

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    jest,
    test
} from "@jest/globals";

describe("Provider S3", () => {

    let sendSpy: jest.SpiedFunction<S3Client["send"]>;

    beforeEach(() => {
        sendSpy = jest.spyOn(S3Client.prototype, "send");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("createBucket()", () => {

        test("Deve criar um bucket", async () => {

            sendSpy.mockResolvedValue({} as never);

            await createBucket("bucket");

            expect(sendSpy).toHaveBeenCalledTimes(1);

            expect(sendSpy.mock.calls[0]![0])
                .toBeInstanceOf(CreateBucketCommand);

        });

    });

    describe("deletBucket()", () => {

        test("Deve deletar um bucket", async () => {

            sendSpy.mockResolvedValue({} as never);

            await deletBucket("bucket");

            expect(sendSpy.mock.calls[0]![0])
                .toBeInstanceOf(DeleteBucketCommand);

        });

    });

    describe("getStorageFile()", () => {

        test("Deve retornar o conteúdo do arquivo", async () => {

            const bytes = Uint8Array.from([1, 2, 3]);

            const transformToByteArray = jest.fn<() => Promise<Uint8Array>>();

            transformToByteArray.mockResolvedValue(bytes);

            sendSpy.mockResolvedValue({
                Body: {
                    transformToByteArray
                }
            } as never);

            const result = await getStorageFile(
                "bucket",
                "foto.png"
            );

            expect(result).toEqual(bytes);

            expect(sendSpy.mock.calls[0]![0])
                .toBeInstanceOf(GetObjectCommand);

        });

        test("Deve lançar erro quando não existir conteúdo", async () => {

            sendSpy.mockResolvedValue({
                Body: undefined
            } as never);

            await expect(
                getStorageFile("bucket", "foto.png")
            ).rejects.toThrow("Arquivo sem conteúdo.");

        });

    });

    describe("getStorageFileUrl()", () => {

        test("Deve gerar a URL corretamente", () => {

            expect(
                getStorageFileUrl(
                    "avatars",
                    "foto.png"
                )
            ).toBe(
                `${ENVIROMENTS.storage.endpoint}/avatars/foto.png`
            );

        });

    });

    describe("uploadStorageFile()", () => {

        test("Deve enviar o arquivo", async () => {

            sendSpy.mockResolvedValue({} as never);

            const file = {
                originalname: "foto.png",
                buffer: Buffer.from("teste")
            } as Express.Multer.File;

            const key = await uploadStorageFile(
                {
                    bucket: "avatars",
                    path: "usuarios",
                    fileName: "123"
                },
                file
            );

            expect(key).toContain("usuarios/123");

            expect(sendSpy.mock.calls[0]![0])
                .toBeInstanceOf(PutObjectCommand);

        });

    });

});