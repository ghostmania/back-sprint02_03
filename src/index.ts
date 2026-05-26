import express from 'express';
import { setupApp } from './setup-app';
import { runDB } from './db/mongo.db';
import { appConfig } from './common/config/config';

const bootstrap = async () => {
  const app = express();
  setupApp(app);
  const PORT = appConfig.PORT;

  await runDB(appConfig.MONGO_URL);

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });
  return app;
};

bootstrap();
