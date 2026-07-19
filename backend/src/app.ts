import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { API_PREFIX } from './config/constants';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		credentials: true,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

app.use(API_PREFIX, routes);

const frontendDist =
  env.FRONTEND_DIST ??
  path.resolve(__dirname, '../../frontend/dist');

if (env.SERVE_FRONTEND) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith(API_PREFIX)) return next();
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
