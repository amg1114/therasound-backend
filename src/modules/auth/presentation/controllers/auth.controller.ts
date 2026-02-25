import { ApiEndpoint } from '@common/infrastructure/decorators';
import { GetUserProfile } from '@modules/auth/application/use-cases/get-user-profile.usecase';
import { LoginUserUseCase } from '@modules/auth/application/use-cases/login-user.usecase';
import { RegisterUserUseCase } from '@modules/auth/application/use-cases/register-user.usecase';
import { CurrentUser } from '@modules/auth/infrastructure/decorators/current-user.decorator';
import { PublicRoute } from '@modules/auth/infrastructure/decorators/public-route.decorator';
import { JwtGuard } from '@modules/auth/infrastructure/guards/jwt.guard';
import { AuthMapper } from '@modules/auth/infrastructure/mappers/auth.mapper';
import { UserEntity } from '@modules/users/domain/entities';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginRequestDto } from '../dto/requests/login-request.dto';
import { RegisterRequestDto } from '../dto/requests/register-request.dto';
import { AuthResponseDto } from '../dto/responses/auth-response.dto';
import { ProfileResponseDto } from '../dto/responses/profile-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly getCurrentUserUseCase: GetUserProfile,
  ) {}

  @PublicRoute()
  @Post('login')
  @ApiEndpoint({
    summary: 'User login',
    description: 'Authenticate user and return access token',
    body: {
      type: LoginRequestDto,
      description: 'User credentials for login',
      required: true,
    },
    responses: [
      {
        status: 200,
        description: 'Usuario autenticado exitosamente',
        type: AuthResponseDto,
      },
      {
        status: 401,
        description: 'Credenciales inválidas',
      },
    ],
  })
  async login(@Body() body: LoginRequestDto): Promise<AuthResponseDto> {
    const result = await this.loginUserUseCase.execute(body);
    return AuthMapper.toAuthResponse(result);
  }

  @PublicRoute()
  @Post('register')
  @ApiEndpoint({
    summary: 'User registration',
    description: 'Register a new user and return access token',
    body: {
      type: RegisterRequestDto,
      description: 'User data for registration',
      required: true,
    },
    responses: [
      {
        status: 201,
        description: 'Usuario registrado exitosamente',
        type: AuthResponseDto,
      },
      {
        status: 400,
        description: 'Datos de registro inválidos',
      },
    ],
  })
  async register(@Body() body: RegisterRequestDto): Promise<AuthResponseDto> {
    const result = await this.registerUserUseCase.execute(body);
    return AuthMapper.toAuthResponse(result);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('me')
  @ApiEndpoint({
    summary: 'Get current user profile',
    description:
      'Retrieve the profile information of the currently authenticated user',
    responses: [
      {
        status: 200,
        description: 'Perfil del usuario obtenido exitosamente',
        type: ProfileResponseDto,
      },
      {
        status: 401,
        description: 'No autorizado, token inválido o expirado',
      },
      {
        status: 404,
        description: 'Usuario no encontrado',
      },
    ],
  })
  async getCurrentUser(@CurrentUser() currentUser: UserEntity) {
    const result = await this.getCurrentUserUseCase.execute(currentUser.id!);
    return AuthMapper.toUserProfileResponse(result);
  }
}
