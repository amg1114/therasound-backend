import { UserEntity } from '@modules/users/domain/entities/user.entity';
import { UserEntityORM } from '../orm/entities/user-entity.orm';

export class UserMapper {
  static toDomain(ormEntity: UserEntityORM): UserEntity {
    const domainEntity = new UserEntity();

    domainEntity.id = ormEntity._id.toString();
    domainEntity.name = ormEntity.name;
    domainEntity.email = ormEntity.email;
    domainEntity.password = ormEntity.password;
    domainEntity.bornAt = ormEntity.bornAt;

    return domainEntity;
  }

  static toORM(domainEntity: UserEntity): Partial<UserEntityORM> {
    return {
      name: domainEntity.name,
      email: domainEntity.email,
      password: domainEntity.password,
      bornAt: domainEntity.bornAt,
    };
  }
}
