import { Response } from 'express';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { usersQueryRepository } from '../../../users/repositories/users.query.repository';
import { RequestWithUserId } from '../../../common/types/requests';
import { IdType } from '../../../common/types/id';

export async function getMeHandler(
  req: RequestWithUserId<IdType>,
  res: Response,
) {
  const userId = req.user?.id as string;

  if (!userId) return res.sendStatus(HttpStatuses.Unauthorized);

  const me = await usersQueryRepository.findByIdOrFail(userId);

  return res.status(HttpStatuses.Success).send({
    email: me.email,
    login: me.login,
    userId: me._id.toString(),
  });
}
