import { ArtistsModule } from '@modules/artists/artists.module';
import { GenresModule } from '@modules/genres/genres.module';
import { PlaylistsModule } from '@modules/playlists/playlists.module';
import { SongsModule } from '@modules/songs/songs.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProfileService } from './application/services/user-profile.service';
import {
  CreateUserPreferencesUseCase,
  GetUserPreferencesUseCase,
  TogglePreferenceUseCase,
} from './application/use-cases/preferences';
import { RegisterListenedSongUseCase } from './application/use-cases/statistics';
import {
  USER_PREFERENCES_REPOSITORY,
  USER_REPOSITORY,
  USER_STATISTICS_REPOSITORY,
} from './domain/repositories';
import {
  MongoUserEntity,
  MongoUserPreferencesEntity,
  UserPreferencesSchema,
  UserSchema,
  UserStatisticsEntityORM,
  UserStatisticsSchema,
} from './infrastructure/orm/entities';
import {
  MongoUserPreferencesRepository,
  MongoUserRepository,
  UserStatisticsRepositoryImpl,
} from './infrastructure/orm/repositories';
import {
  UserPreferencesController,
  UserStatisticsController,
} from './presentation/controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MongoUserEntity.name,
        schema: UserSchema,
      },
      {
        name: MongoUserPreferencesEntity.name,
        schema: UserPreferencesSchema,
      },
      {
        name: UserStatisticsEntityORM.name,
        schema: UserStatisticsSchema,
      },
    ]),
    ArtistsModule,
    GenresModule,
    forwardRef(() => SongsModule),
    forwardRef(() => PlaylistsModule),
  ],
  controllers: [UserPreferencesController, UserStatisticsController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
    {
      provide: USER_PREFERENCES_REPOSITORY,
      useClass: MongoUserPreferencesRepository,
    },
    {
      provide: USER_STATISTICS_REPOSITORY,
      useClass: UserStatisticsRepositoryImpl,
    },

    UserProfileService,

    CreateUserPreferencesUseCase,
    GetUserPreferencesUseCase,
    TogglePreferenceUseCase,

    RegisterListenedSongUseCase,
  ],
  exports: [
    USER_REPOSITORY,
    USER_PREFERENCES_REPOSITORY,
    USER_STATISTICS_REPOSITORY,
    UserProfileService,
  ],
})
export class UsersModule {}
