import { CurrentUserId } from '@modules/auth/infrastructure/decorators/current-user.decorator';
import { GeneratePlaylistUseCase } from '@modules/playlists/application/use-cases/generate-playlist.usecase';
import { GetPlaylistByIdUseCase } from '@modules/playlists/application/use-cases/get-playlist-by-id.usecase';
import { GetUserPlaylistsUseCase } from '@modules/playlists/application/use-cases/get-user-playlists.usecase';
import { PlaylistMapper } from '@modules/playlists/infrastructure/mappers/playlist.mapper';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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

  @ApiOperation({
    summary: 'Generate a playlist based on conversation emotion analysis',
    description:
      'Analyzes the conversation history to detect emotion and generates a personalized playlist',
  })
  @ApiResponse({
    status: 201,
    description: 'Playlist successfully generated',
    type: PlaylistResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Post('generate')
  async generatePlaylist(
    @CurrentUserId() userId: string,
    @Body() body: GeneratePlaylistRequestDto,
  ): Promise<PlaylistResponseDto> {
    const playlist = await this.generatePlaylistUseCase.execute(userId, body);
    return PlaylistMapper.toResponseDto(playlist);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all playlists for the current user',
    description: 'Retrieves all playlists created by the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Playlists retrieved successfully',
    type: [PlaylistResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserPlaylists(
    @CurrentUserId() userId: string,
  ): Promise<PlaylistResponseDto[]> {
    const playlists = await this.getUserPlaylistsUseCase.execute(userId);
    return playlists.map((playlist) => PlaylistMapper.toResponseDto(playlist));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get playlist by ID',
    description: 'Retrieves a specific playlist by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Playlist ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Playlist found',
    type: PlaylistResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Playlist not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getPlaylistById(@Param('id') id: string): Promise<PlaylistResponseDto> {
    const playlist = await this.getPlaylistByIdUseCase.execute(id);
    return PlaylistMapper.toResponseDto(playlist);
  }
}
