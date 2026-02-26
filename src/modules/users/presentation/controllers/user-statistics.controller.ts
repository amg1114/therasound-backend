import { ApiEndpoint } from '@common/infrastructure/decorators';
import { CurrentUserId } from '@modules/auth/infrastructure/decorators/current-user.decorator';
import { RegisterListenedSongUseCase } from '@modules/users/application/use-cases/statistics';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegisterListenedSongDto } from '../dto/requests/statistics';

@Controller('users/statistics')
@ApiBearerAuth()
@ApiTags('User Statistics')
export class UserStatisticsController {
  constructor(
    private readonly registerListenedSongUseCase: RegisterListenedSongUseCase,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('listened-song')
  @ApiEndpoint({
    summary: 'Register Listened Song',
    description: 'Registers a listened song for the current user.',
    responses: [
      {
        status: HttpStatus.NO_CONTENT,
        description: 'Successfully registered the listened song.',
      },
      {
        status: HttpStatus.NOT_FOUND,
        description:
          'User statistics, preferences, or the song were not found.',
      },
      {
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized. User authentication is required.',
      },
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'An unexpected error occurred while registering the song.',
      },
    ],
  })
  async registerListenedSong(
    @Body() dto: RegisterListenedSongDto,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    await this.registerListenedSongUseCase.execute(userId, dto);
  }
}
