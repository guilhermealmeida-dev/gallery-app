<<<<<<< HEAD
<<<<<<< HEAD
import dotenv from "dotenv";
import { exit } from "node:process";
import app from "./app.js";
import { ENVIROMENTS } from "./env-config.ts";
import { createBucket } from "./providers/s3-storage.ts";
=======
import { exit } from "node:process";
import app from "./app.js";
import dotenv from "dotenv";
>>>>>>> chore/card-5/configurar-back-end
=======
import dotenv from "dotenv";
import { exit } from "node:process";
import app from "./app.js";
import { ENVIROMENTS } from "./env-config.ts";
import { createBucket } from "./providers/s3-storage.ts";
>>>>>>> feat/card-13/storage-provider

function startServer() {
    dotenv.config();

    const host = ENVIROMENTS.host.address ?? "localhost";
    const port = ENVIROMENTS.host.port ?? 4000;

    if (!host || !port) {
        console.error("Environment variables not provided");
        exit(1);
    }

    //Providers
    createBucket(ENVIROMENTS.storage.buckets.profiles);
    createBucket(ENVIROMENTS.storage.buckets.photos);

    app.listen(port, host, () => {
        console.log(`Servidor em execução http://${host}:${port}`);
    });
}

startServer();