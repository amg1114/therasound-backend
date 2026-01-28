import { LoginUserUseCase } from '@modules/auth/application/use-cases/login-user.usecase';
import { RegisterUserUseCase } from '@modules/auth/application/use-cases/register-user.usecase';
import { PublicRoute } from '@modules/auth/infrastructure/decorators/public-route.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { LoginRequestDto } from '../dto/requests/login-request.dto';
import { RegisterRequestDto } from '../dto/requests/register-request.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
  ) {}

  @ApiOperation({ summary: 'User login' })
  @PublicRoute()
  @Post('login')
  login(@Body() body: LoginRequestDto) {
    return this.loginUserUseCase.execute(body);
  }
  @ApiOperation({ summary: 'User registration' })
  @PublicRoute()
  @Post('register')
  register(@Body() body: RegisterRequestDto) {
    return this.registerUserUseCase.execute(body);
  }
}
