import { forwardRef, Module } from '@nestjs/common';
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
import { UserPreferencesController } from './presentation/controllers/user-preferences.controller';
import { SongsModule } from '@modules/songs/songs.module';
import { SongLikedListener } from './application/listeners/song-liked.listener';
import { ToggleSongPreferencesUseCase } from './application/use-cases/toggle-song-preferences.usecase';
import { UpdateArtistsPreferencesUseCase } from './application/use-cases/update-artists-prefereces.usecase';
import { UpdateGenresPreferencesUseCase } from './application/use-cases/update-genres-preferences.usecase';

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

    SongLikedListener,
  ],
  exports: [
    USER_REPOSITORY,
    USER_PREFERENCES_REPOSITORY,
    CreateUserPreferencesUseCase,
    GetUserPreferencesUseCase,
  ],
})
export class UsersModule {}
