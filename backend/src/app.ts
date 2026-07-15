import express, { json, type Express, type Request, type Response } from 'express';
import { errorLog } from './middlewares/error-log.ts';
import { errorHandler } from './middlewares/error-handler.ts';
import { authRoute } from './routes/auth-routes.ts';
import { swaggerInit } from './swagger.ts';
import path from 'node:path';
import { userRouter } from './routes/user.route.ts';

const app: Express = express();

//Configs
app.use(json())
app.set("view engine", "pug");
app.set("views", path.join(process.cwd(), "/src/views"));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

//Routes
app.use("/auth", authRoute);
app.use("/user", userRouter);

//Middlewares
app.use(errorLog);
app.use(errorHandler);

swaggerInit(app);

export default app;