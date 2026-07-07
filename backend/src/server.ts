import dotenv from "dotenv";
import { exit } from "node:process";
import app from "./app.js";
import { ENVIROMENTS } from "./env-config.ts";

function startServer() {
    dotenv.config();

    const host = ENVIROMENTS.host.address??"localhost";
    const port = ENVIROMENTS.host.port??4000;

    if (!host || !port) {
        console.error("Environment variables not provided");
        exit(1);
    }

    app.listen(port, host, () => {
        console.log(`Servidor em execução http://${host}:${port}`);
    });
}

startServer();