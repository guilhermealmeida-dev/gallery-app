import SwaggerParser from "@apidevtools/swagger-parser";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";

export async function swaggerInit(app: Express) {
  const swaggerPath = path.join(process.cwd(), "docs", "swagger.json");

  const swaggerDocument = await SwaggerParser.dereference(swaggerPath);

  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true
      }
    })
  );
}