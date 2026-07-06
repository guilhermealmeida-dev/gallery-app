import express, { type Express, type Request, type Response } from 'express';
import { errorLog } from './middlewares/error-log.ts';
import { errorHandler } from './middlewares/error-handler.ts';
import { authRoute } from './routes/auth-routes.ts';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

//Routes
app.use("/auth",authRoute);

//Middlewares
app.use(errorLog);
app.use(errorHandler);

export default app;