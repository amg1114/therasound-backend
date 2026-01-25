import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_CONFIG_SCHEMA, appConfig } from './app.config';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { SongsModule } from './modules/songs/songs.module';
import { MongooseModule } from '@nestjs/mongoose';

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
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
        dbName: config.get<string>('database.name'),
      }),
      inject: [ConfigService],
    }),
    ChatbotModule,
    SongsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
