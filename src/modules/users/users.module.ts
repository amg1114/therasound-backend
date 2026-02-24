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
import {
  USER_PREFERENCES_REPOSITORY,
  USER_REPOSITORY,
  USER_STATISTICS_REPOSITORY,
} from './domain/repositories';
import {
  UserEntityORM,
  UserPreferencesEntityORM,
  UserPreferencesSchema,
  UserSchema,
  UserStatisticsEntityORM,
  UserStatisticsSchema,
} from './infrastructure/orm/entities';
import {
  UserPreferencesRepositoryImpl,
  UserRepositoryImpl,
  UserStatisticsRepositoryImpl,
} from './infrastructure/orm/repositories';
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
    {
      provide: USER_STATISTICS_REPOSITORY,
      useClass: UserStatisticsRepositoryImpl,
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
    USER_STATISTICS_REPOSITORY,
    CreateUserPreferencesUseCase,
    GetUserPreferencesUseCase,
  ],
})
export class UsersModule {}
