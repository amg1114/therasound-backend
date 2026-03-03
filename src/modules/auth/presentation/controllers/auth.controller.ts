import { ApiEndpoint } from '@common/infrastructure/decorators';
import {
  ChangePasswordUseCase,
  GetUserProfile,
  LoginUserUseCase,
  RegisterUserUseCase,
  UpdateUserProfileUseCase,
} from '@modules/auth/application/use-cases';

import {
  CurrentUser,
  CurrentUserId,
} from '@modules/auth/infrastructure/decorators/current-user.decorator';
import { PublicRoute } from '@modules/auth/infrastructure/decorators/public-route.decorator';
import { JwtGuard } from '@modules/auth/infrastructure/guards/jwt.guard';
import { AuthMapper } from '@modules/auth/infrastructure/mappers/auth.mapper';
import { UserEntity } from '@modules/users/domain/entities';
import { UserMapper } from '@modules/users/infrastructure/mappers';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ChangePasswordRequestDto,
  UpdateUserProfileDto,
} from '../dto/requests';
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
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
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

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Patch('me')
  @ApiEndpoint({
    summary: 'Update current user profile',
    description:
      'Update the profile information of the currently authenticated user',
    body: {
      type: UpdateUserProfileDto,
      description: 'Data for updating user profile',
      required: true,
    },
    responses: [
      {
        status: 200,
        description: 'Perfil del usuario actualizado exitosamente',
        type: ProfileResponseDto,
      },
      {
        status: 400,
        description: 'Datos de actualización inválidos',
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
  async updateCurrentUser(
    @CurrentUserId() userId: string,
    @Body() body: UpdateUserProfileDto,
  ) {
    const result = await this.updateUserProfileUseCase.execute(userId, body);
    return UserMapper.toResponseDto(result);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('change-password')
  @ApiEndpoint({
    summary: 'Change user password',
    description:
      'Allows the authenticated user to change their password by providing the current and new passwords.',
    body: {
      type: ChangePasswordRequestDto,
      description: 'Data for changing user password',
      required: true,
    },
    responses: [
      {
        status: 204,
        description: 'Contraseña cambiada exitosamente',
      },
      {
        status: 400,
        description: 'Datos de cambio de contraseña inválidos',
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
  async changePassword(
    @CurrentUserId() userId: string,
    @Body() body: ChangePasswordRequestDto,
  ) {
    return await this.changePasswordUseCase.execute(userId, body);
  }
}
