import { BucketAlreadyExists, CreateBucketCommand, DeleteBucketCommand, GetObjectCommand, NoSuchBucket, NoSuchKey, PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import { UploadOptions } from "../types/upload.ts";
import path from "path";
import { ENVIROMENTS } from "../env-config.ts";

const s3 = new S3Client({
    region: ENVIROMENTS.storage.region,
    endpoint: ENVIROMENTS.storage.endpoint,
    credentials: {
        accessKeyId: ENVIROMENTS.storage.access_key_id,
        secretAccessKey: ENVIROMENTS.storage.secret_key
    }
});

//Criar Bucket
export async function createBucket(bucketName: string) {
    try {
        const comand = new CreateBucketCommand({
            Bucket: bucketName
        });
        await s3.send(comand);
        console.log(`Bucket ${bucketName} criado com sucesso!`)
    } catch (error) {
        if (error instanceof BucketAlreadyExists) {
            console.log(`Bucket ${bucketName} já existe`);
            return;
        }
        throw new Error("Erro ao criar bucket:\n" + error);
    }
}

//Deletar bucket
export async function deletBucket(bucketName: string) {
    try {
        const comand = new DeleteBucketCommand({ Bucket: bucketName })
        await s3.send(comand);
    } catch (error) {
        throw new Error("Erro ao deletar bucket:\n" + error);
    }
}

//Buscar arquivo
export async function getStorageFile(
    bucket: string,
    key: string
) {
    try {
        const comand = new GetObjectCommand({ Bucket: bucket, Key: key });
        const file = await s3.send(comand);
        if (!file.Body) {
            throw new Error("Arquivo sem conteúdo.");
        }

        const bytes = await file.Body.transformToByteArray();
        return Buffer.from(bytes);
    } catch (error) {

        if (error instanceof NoSuchKey) {
            throw new Error("Arquivo não encontrado.");
        }

        if (error instanceof NoSuchBucket) {
            throw new Error("Bucket não encontrado.");
        }

        if (error instanceof S3ServiceException) {
            throw new Error(error.message);
        }

        throw error;
    }
}

//Gera o caminho completo do arquivo
export function getStorageFileUrl(
    bucket: string,
    key: string
): string {
    return `${ENVIROMENTS.storage.endpoint}/${bucket}/${key}`;
}

//Realiza upload de um arquivo
export async function uploadStorageFile(
    options: UploadOptions,
    file: Express.Multer.File
): Promise<string> {
    try {
        //TODO: implementar credenciais para seguranca de acesso aos recursos
        const extension = path.extname(file.originalname);
        const key = `${options.path}/${options.fileName}.${extension}`

        const comand = new PutObjectCommand({
            Bucket: options.bucket,
            Key: key,
            Body: file.buffer
        });

        await s3.send(comand);
        return key;
    } catch (error) {
        throw new Error("Erro ao fazer upload:\n" + error);
    }
}