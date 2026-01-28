import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './infrastructure/guards/jwt.guard';
import { LoginUserUseCase } from './application/use-cases/login-user.usecase';
import { RegisterUserUseCase } from './application/use-cases/register-user.usecase';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    UsersModule,
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
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
