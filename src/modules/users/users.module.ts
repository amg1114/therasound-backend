import { SongsModule } from '@modules/songs/songs.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CreateUserPreferencesUseCase,
  GetUserPreferencesUseCase,
  ToggleSongPreferencesUseCase,
  UpdateArtistsPreferencesUseCase,
  UpdateGenresPreferencesUseCase,
} from './application/use-cases/preferences';
import { USER_PREFERENCES_REPOSITORY } from './domain/repositories/user-preferences-repository.interface';
import { USER_REPOSITORY } from './domain/repositories/user-repository.interface';
import {
  UserEntityORM,
  UserPreferencesEntityORM,
  UserPreferencesSchema,
  UserSchema,
  UserStatisticsEntityORM,
  UserStatisticsSchema,
} from './infrastructure/orm/entities';
import { UserPreferencesRepositoryImpl } from './infrastructure/orm/repositories/user-preferences.repository';
import { UserRepositoryImpl } from './infrastructure/orm/repositories/user.repository';
import { UserPreferencesController } from './presentation/controllers/user-preferences.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserEntityORM.name,
        schema: UserSchema,
      },
      {
        name: UserPreferencesEntityORM.name,
        schema: UserPreferencesSchema,
      },
      {
        name: UserStatisticsEntityORM.name,
        schema: UserStatisticsSchema,
      },
    ]),
    forwardRef(() => SongsModule),
  ],
  controllers: [UserPreferencesController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
    {
      provide: USER_PREFERENCES_REPOSITORY,
      useClass: UserPreferencesRepositoryImpl,
    },

    CreateUserPreferencesUseCase,
    GetUserPreferencesUseCase,
    ToggleSongPreferencesUseCase,
    UpdateArtistsPreferencesUseCase,
    UpdateGenresPreferencesUseCase,
  ],
  exports: [
    USER_REPOSITORY,
    USER_PREFERENCES_REPOSITORY,
    CreateUserPreferencesUseCase,
    GetUserPreferencesUseCase,
  ],
})
export class UsersModule {}
