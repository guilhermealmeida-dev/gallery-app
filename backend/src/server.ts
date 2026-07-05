import { exit } from "node:process";
import app from "./app.js";
import dotenv from "dotenv";

function startServer() {
    dotenv.config();

    const host = process.env.HOST;
    const port = Number(process.env.PORT);

    if (!host || !port) {
        console.error("Environment variables not provided");
        exit(1);
    }

    app.listen(port, host, () => {
        console.log(`Servidor em execução http://${host}:${port}`);
    });
}

startServer();