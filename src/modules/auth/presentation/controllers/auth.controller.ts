import { GetUserProfile } from '@modules/auth/application/use-cases/get-user-profile.usecase';
import { LoginUserUseCase } from '@modules/auth/application/use-cases/login-user.usecase';
import { RegisterUserUseCase } from '@modules/auth/application/use-cases/register-user.usecase';
import { CurrentUser } from '@modules/auth/infrastructure/decorators/current-user.decorator';
import { PublicRoute } from '@modules/auth/infrastructure/decorators/public-route.decorator';
import { JwtGuard } from '@modules/auth/infrastructure/guards/jwt.guard';
import { AuthMapper } from '@modules/auth/infrastructure/mappers/auth.mapper';
import { UserEntity } from '@modules/users/domain/entities';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Usuario autenticado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  @PublicRoute()
  @Post('login')
  async login(@Body() body: LoginRequestDto): Promise<AuthResponseDto> {
    const result = await this.loginUserUseCase.execute(body);
    return AuthMapper.toAuthResponse(result);
  }

  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario con este email ya existe',
  })
  @PublicRoute()
  @Post('register')
  async register(@Body() body: RegisterRequestDto): Promise<AuthResponseDto> {
    const result = await this.registerUserUseCase.execute(body);
    return AuthMapper.toAuthResponse(result);
  }

  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns the current authenticated user data and preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del usuario obtenidos exitosamente',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() currentUser: UserEntity) {
    const result = await this.getCurrentUserUseCase.execute(currentUser.id!);
    return AuthMapper.toUserProfileResponse(result);
  }
}
