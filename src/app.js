import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// Behind a proxy (web nginx on Railway) → trust N hops so req.ip (rate limiting) is the real client
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY));

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
