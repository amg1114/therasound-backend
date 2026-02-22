import { ApiEndpoint } from '@common/infrastructure/decorators';
import { CurrentUserId } from '@modules/auth/infrastructure/decorators/current-user.decorator';
import { GeneratePlaylistUseCase } from '@modules/playlists/application/use-cases/generate-playlist.usecase';
import { GetPlaylistByIdUseCase } from '@modules/playlists/application/use-cases/get-playlist-by-id.usecase';
import { GetUserPlaylistsUseCase } from '@modules/playlists/application/use-cases/get-user-playlists.usecase';
import { PlaylistMapper } from '@modules/playlists/infrastructure/mappers/playlist.mapper';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GeneratePlaylistRequestDto } from '../dto/requests/generate-playlist-request.dto';
import { PlaylistResponseDto } from '../dto/responses/playlist-response.dto';

@ApiTags('playlists')
@ApiBearerAuth()
@Controller('playlists')
export class PlaylistsController {
  constructor(
    private readonly generatePlaylistUseCase: GeneratePlaylistUseCase,
    private readonly getPlaylistByIdUseCase: GetPlaylistByIdUseCase,
    private readonly getUserPlaylistsUseCase: GetUserPlaylistsUseCase,
  ) {}

  @ApiEndpoint({
    summary: 'Generate a new playlist',
    description:
      "Generates a new playlist based on the provided user-chatbot conversation history. The system analyzes the conversation to detect emotions and creates a playlist that matches the user's emotional state.",
    body: {
      type: GeneratePlaylistRequestDto,
      description: 'The conversation history to analyze for emotion detection',
    },
    responses: [
      {
        status: 201,
        description: 'Playlist generated successfully',
        type: PlaylistResponseDto,
      },
      {
        status: 400,
        description: 'Invalid request data',
      },
      {
        status: 401,
        description: 'Unauthorized',
      },
    ],
  })
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generatePlaylist(
    @CurrentUserId() userId: string,
    @Body() body: GeneratePlaylistRequestDto,
  ): Promise<PlaylistResponseDto> {
    const playlist = await this.generatePlaylistUseCase.execute(userId, body);
    return PlaylistMapper.toResponseDto(playlist);
  }

  @ApiEndpoint({
    summary: 'Get user playlists',
    description: 'Retrieves all playlists created by the authenticated user',
    responses: [
      {
        type: PlaylistResponseDto,
        status: 200,
        description: 'Playlists retrieved successfully',
        isArray: true,
      },
      {
        status: 401,
        description: 'Unauthorized',
      },
    ],
  })
  @Get()
  async getUserPlaylists(
    @CurrentUserId() userId: string,
  ): Promise<PlaylistResponseDto[]> {
    const playlists = await this.getUserPlaylistsUseCase.execute(userId);
    return playlists.map((playlist) => PlaylistMapper.toResponseDto(playlist));
  }

  @ApiEndpoint({
    summary: 'Get playlist by ID',
    description: 'Retrieves a specific playlist by its ID',
    params: [
      {
        name: 'id',
        description: 'Playlist ID',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Playlist found',
        type: PlaylistResponseDto,
      },
      {
        status: 404,
        description: 'Playlist not found',
      },
      {
        status: 401,
        description: 'Unauthorized',
      },
    ],
  })
  @Get(':id')
  async getPlaylistById(@Param('id') id: string): Promise<PlaylistResponseDto> {
    const playlist = await this.getPlaylistByIdUseCase.execute(id);
    return PlaylistMapper.toResponseDto(playlist);
  }
}
