import { LoginAttributes } from '../dto/login.attributes';
import { usersQueryRepository } from '../../users/repositories/users.query.repository';
import { bcryptService } from '../adapters/bcrypt.service';
import { Result } from '../../common/result/result.type';
import { jwtService } from '../adapters/jwt.service';
import { ResultStatus } from '../../common/result/resultCode';
import { WithId } from 'mongodb';
import { User } from '../../users/types/user';

export const authService = {
  async login(
    dto: LoginAttributes,
  ): Promise<Result<{ accessToken: string } | null>> {
    const result = await this.checkUserCredentials(
      dto.loginOrEmail,
      dto.password,
    );
    if (result.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Wrong credentials' }],
        data: null,
      };
    }

    const accessToken = await jwtService.createToken(
      result.data!._id.toString(),
    );

    return {
      status: ResultStatus.Success,
      data: { accessToken },
      extensions: [],
    };
  },
  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<WithId<User> | null>> {
    const user = await usersQueryRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
      };
    }
    const isPassCorrect = await bcryptService.compare(
      password,
      user.passwordHash,
    );
    if (!isPassCorrect)
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'password', message: 'Wrong password' }],
      };
    return {
      status: ResultStatus.Success,
      data: user,
      extensions: [],
    };
  },
};
