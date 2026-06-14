import { WithId } from 'mongodb';
import { UsersQueryInput } from '../routers/input/users-query.input';
import { User } from '../types/user';
import { usersRepository } from '../repositories/users.repository';
import { usersQueryRepository } from '../repositories/users.query.repository';
import { UserAttributes } from '../dto/user.attributes';
import { HttpStatus } from '../../core/types/http-statuses';
import { DomainError } from '../../core/errors/domain.error';
import { bcryptService } from '../../auth/adapters/bcrypt.service';

export const usersService = {
  async findMany(
    queryDto: UsersQueryInput,
  ): Promise<{ users: WithId<User>[]; totalCount: number }> {
    return usersQueryRepository.findMany(queryDto);
  },

  async createUser(dto: UserAttributes): Promise<string> {
    const passwordHash = await bcryptService.generateHash(dto.password);
    const newUser: User = {
      login: dto.login,
      email: dto.email,
      passwordHash,
      createdAt: new Date(),
      emailConfirmation: null,
    };
    return usersRepository.create(newUser);
  },

  async findByIdOrFail(id: string): Promise<WithId<User>> {
    return usersQueryRepository.findByIdOrFail(id);
  },

  async delete(id: string): Promise<void> {
    const user = await usersRepository.findById(id);

    if (!user) {
      throw new DomainError(`User not found`, HttpStatus.NotFound);
    }

    await usersRepository.delete(id);
  },
};
