import { UserEntity } from '../entities/user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  create(user: UserEntity): Promise<UserEntity>;

  findById(id: string): Promise<UserEntity | null>;

  findByEmail(email: string): Promise<UserEntity | null>;

  update(user: UserEntity): Promise<UserEntity>;

  delete(id: string): Promise<void>;
}
