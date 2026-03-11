import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { APP_CONFIG_SCHEMA, appConfig } from './config/app.config';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { GenresModule } from './modules/genres/genres.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { SongsModule } from './modules/songs/songs.module';
import { UsersModule } from './modules/users/users.module';
import { ArtistsModule } from './modules/artists/artists.module';
import { ListeningSessionsModule } from './modules/listening-sessions/listening-sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: APP_CONFIG_SCHEMA,
      validationOptions: {
        abortEarly: true,
      },
    }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
        dbName: config.get<string>('database.name'),
      }),
      inject: [ConfigService],
    }),
    ChatbotModule,
    SongsModule,
    UsersModule,
    AuthModule,
    PlaylistsModule,
    GenresModule,
    AdminModule,
    CommonModule,
    ArtistsModule,
    ListeningSessionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
