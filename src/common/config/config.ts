import { config } from 'dotenv';

config();

export const appConfig = {
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL as string,
  DB_NAME: process.env.DB_NAME as string,
  AC_SECRET: process.env.AC_SECRET as string,
  AC_TIME: process.env.AC_TIME as string,
  RT_SECRET: process.env.RT_SECRET,
  DB_TYPE: process.env.DB_TYPE,
  EMAIL: process.env.EMAIL as string,
  EMAIL_FROM: process.env.EMAIL_FROM as string,
  CONFIRM_EMAIL_URL: process.env.CONFIRM_EMAIL_URL as string,
  GOOGLE_APP_PASSWORD: process.env.GOOGLE_APP_PASSWORD as string,
};
