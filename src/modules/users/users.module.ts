import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserEntityORM,
  UserSchema,
} from './infrastructure/orm/entities/user-entity.orm';
import {
  UserPreferencesEntityORM,
  UserPreferencesSchema,
} from './infrastructure/orm/entities/user-preferences-entity.orm';
import { USER_REPOSITORY } from './domain/repositories/user-repository.interface';
import { USER_PREFERENCES_REPOSITORY } from './domain/repositories/user-preferences-repository.interface';
import { UserRepositoryImpl } from './infrastructure/orm/repositories/user.repository';
import { UserPreferencesRepositoryImpl } from './infrastructure/orm/repositories/user-preferences.repository';
import { CreateUserPreferencesUseCase } from './application/use-cases/create-user-preferences.usecase';
import { GetUserPreferencesUseCase } from './application/use-cases/get-user-preferences.usecase';
import { UpdateLikedSongsUseCase } from './application/use-cases/update-liked-songs.usecase';
import { UpdateDislikedSongsUseCase } from './application/use-cases/update-disliked-songs.usecase';
import { UpdateDislikedGenresUseCase } from './application/use-cases/update-disliked-genres.usecase';
import { UpdateDislikedArtistsUseCase } from './application/use-cases/update-disliked-artists.usecase';
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
    ]),
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
    UpdateLikedSongsUseCase,
    UpdateDislikedSongsUseCase,
    UpdateDislikedGenresUseCase,
    UpdateDislikedArtistsUseCase,
  ],
  exports: [
    USER_REPOSITORY,
    USER_PREFERENCES_REPOSITORY,
    CreateUserPreferencesUseCase,
    GetUserPreferencesUseCase,
    UpdateLikedSongsUseCase,
    UpdateDislikedSongsUseCase,
    UpdateDislikedGenresUseCase,
    UpdateDislikedArtistsUseCase,
  ],
})
export class UsersModule {}
