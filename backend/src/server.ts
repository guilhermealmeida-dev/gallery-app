import dotenv from "dotenv";
import { exit } from "node:process";
import app from "./app.js";
import { ENVIROMENTS } from "./env-config.ts";
import { createBucket } from "./providers/s3-storage.ts";
import { verfyMail } from "./providers/mail/node-mail.ts";

function startServer() {
    dotenv.config();

    const host = ENVIROMENTS.hosts.api.host ?? "localhost";
    const port = ENVIROMENTS.hosts.api.port ?? 4000;

    if (!host || !port) {
        console.error("Environment variables not provided");
        exit(1);
    }

    //Providers
    createBucket(ENVIROMENTS.storage.buckets.profiles);
    createBucket(ENVIROMENTS.storage.buckets.photos);
    verfyMail();

    app.listen(port, host, () => {
        console.log(`Servidor em execução http://${host}:${port}`);
    });
}

startServer();

