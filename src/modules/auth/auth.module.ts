import { PlaylistsModule } from '@modules/playlists/playlists.module';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GetUserProfile } from './application/use-cases/get-user-profile.usecase';
import { LoginUserUseCase } from './application/use-cases/login-user.usecase';
import { RegisterUserUseCase } from './application/use-cases/register-user.usecase';
import { JwtGuard } from './infrastructure/guards/jwt.guard';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    UsersModule,
    PlaylistsModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    LoginUserUseCase,
    RegisterUserUseCase,
    GetUserProfile,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
