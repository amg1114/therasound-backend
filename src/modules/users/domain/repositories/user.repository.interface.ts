import { CreateUserEntityProps, UserEntity } from '../entities';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepository {
  create(user: CreateUserEntityProps): Promise<UserEntity>;

  findById(id: string): Promise<UserEntity | null>;

  findByEmail(email: string): Promise<UserEntity | null>;

  save(user: UserEntity): Promise<UserEntity>;

  delete(id: string): Promise<void>;
}
