import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_CONFIG_SCHEMA, appConfig } from './app.config';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { SongsModule } from './modules/songs/songs.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
