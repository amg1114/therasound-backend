import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_CONFIG_SCHEMA, appConfig } from './app.config';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { SongsModule } from './modules/songs/songs.module';

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
    ChatbotModule,
    SongsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
