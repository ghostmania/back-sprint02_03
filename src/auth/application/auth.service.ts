import { LoginAttributes } from '../dto/login.attributes';
import { usersQueryRepository } from '../../users/repositories/users.query.repository';
import { bcryptService } from '../adapters/bcrypt.service';

export const authService = {
  async login(dto: LoginAttributes): Promise<boolean> {
    const user = await usersQueryRepository.findByLoginOrEmail(
      dto.loginOrEmail,
    );
    if (!user) return false;
    return bcryptService.compare(dto.password, user.passwordHash);
  },
};
