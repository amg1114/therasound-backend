import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GeneratePlaylistUseCase } from '@modules/playlists/application/use-cases/generate-playlist.usecase';
import { GeneratePlaylistRequestDto } from '../dto/requests/generate-playlist-request.dto';
import { PlaylistResponseDto } from '../dto/responses/playlist-response.dto';
import { CurrentUserId } from '@modules/auth/infrastructure/decorators/current-user.decorator';

@ApiTags('playlists')
@ApiBearerAuth()
@Controller('playlists')
export class PlaylistsController {
  constructor(
    private readonly generatePlaylistUseCase: GeneratePlaylistUseCase,
  ) {}

  @ApiOperation({
    summary: 'Generate a playlist based on conversation emotion analysis',
    description:
      'Analyzes the conversation history to detect emotion and generates a personalized playlist',
  })
  @Post('generate')
  async generatePlaylist(
    @CurrentUserId() userId: string,
    @Body() body: GeneratePlaylistRequestDto,
  ): Promise<PlaylistResponseDto> {
    return this.generatePlaylistUseCase.execute(userId, body);
  }
}
