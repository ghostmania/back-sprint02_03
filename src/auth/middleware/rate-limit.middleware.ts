import { NextFunction, Request, Response } from 'express';
import { apiRequestsCollection } from '../../db/mongo.db';
import { HttpStatus } from '../../core/types/http-statuses';

// Окно подсчёта (10 секунд) и максимально допустимое число запросов в этом окне.
const RATE_LIMIT_WINDOW_MS = 10 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const IP = req.ip ?? 'unknown';
  const URL = req.originalUrl;
  const date = new Date();

  // Сохраняем каждый случай обращения к api.
  await apiRequestsCollection.insertOne({ IP, URL, date });

  // Считаем количество обращений за последние 10 секунд по этому IP и URL.
  const tenSecondsAgo = new Date(date.getTime() - RATE_LIMIT_WINDOW_MS);
  const requestsCount = await apiRequestsCollection.countDocuments({
    IP,
    URL,
    date: { $gte: tenSecondsAgo },
  });

  if (requestsCount > RATE_LIMIT_MAX_REQUESTS) {
    res.sendStatus(HttpStatus.TooManyRequests);
    return;
  }

  next();
};
