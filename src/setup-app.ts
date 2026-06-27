import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { blogsRouter } from './blogs/routers/blogs.router';
import { postsRouter } from './posts/routers/posts.router';
import { setupSwagger } from './core/swagger/setup-swagger';
import { testingRouter } from './testing/routers/testing.router';
import { usersRouter } from './users/routers/users.router';
import { authRouter } from './auth/routers/auth.router';
import { commentsRouter } from './comments/routers/comments.router';
import { securityDevicesRouter } from './securityDevices/routers/security-devices.router';

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса
  app.use(cookieParser());
  app.set('trust proxy', true)
  // основной роут
  app.get('/', (req, res) => {
    res.status(200).send('Hello world!');
  });

  app.use('/blogs', blogsRouter);
  app.use('/posts', postsRouter);
  app.use('/comments', commentsRouter);
  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/security/devices', securityDevicesRouter);
  app.use('/testing', testingRouter);

  setupSwagger(app);
  return app;
};
