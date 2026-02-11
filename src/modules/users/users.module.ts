import { SongsModule } from '@modules/songs/songs.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateUserPreferencesUseCase } from './application/use-cases/create-user-preferences.usecase';
import { GetUserPreferencesUseCase } from './application/use-cases/get-user-preferences.usecase';
import { ToggleSongPreferencesUseCase } from './application/use-cases/toggle-song-preferences.usecase';
import { UpdateArtistsPreferencesUseCase } from './application/use-cases/update-artists-prefereces.usecase';
import { UpdateGenresPreferencesUseCase } from './application/use-cases/update-genres-preferences.usecase';
import { USER_PREFERENCES_REPOSITORY } from './domain/repositories/user-preferences-repository.interface';
import { USER_REPOSITORY } from './domain/repositories/user-repository.interface';
import {
  UserEntityORM,
  UserSchema,
} from './infrastructure/orm/entities/user-entity.orm';
import {
  UserPreferencesEntityORM,
  UserPreferencesSchema,
} from './infrastructure/orm/entities/user-preferences-entity.orm';
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
