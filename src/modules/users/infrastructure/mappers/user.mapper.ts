import { UserEntity } from '@modules/users/domain/entities/user.entity';
import { UserEntityORM } from '../orm/entities/user-entity.orm';
import { UserResponseDto } from '@modules/users/presentation/dto/responses/user-response.dto';

export class UserMapper {
  static toDomain(ormEntity: UserEntityORM): UserEntity {
    const domainEntity = UserEntity.create({
      id: ormEntity._id.toString(),
      name: ormEntity.name,
      email: ormEntity.email,
      password: ormEntity.password,
      bornAt: ormEntity.bornAt,
    });

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

  static toResponseDto(domainEntity: UserEntity) {
    const response = new UserResponseDto();

    response.id = domainEntity.id!;
    response.name = domainEntity.name;
    response.email = domainEntity.email;
    response.bornAt = domainEntity.bornAt;

    return response;
  }
}
