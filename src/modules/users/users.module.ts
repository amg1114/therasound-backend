import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserEntityORM,
  UserSchema,
} from './infrastructure/orm/entities/user-entity.orm';
import { USER_REPOSITORY } from './domain/repositories/user-repository.interface';
import { UserRepositoryImpl } from './infrastructure/orm/repositories/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserEntityORM.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
