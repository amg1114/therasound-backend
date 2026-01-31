import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RegisterSongBySpotifyIdUseCase } from '@modules/songs/application/use-cases/register-song-by-spotify-id.usecase';
import { GetSongByIdUseCase } from '@modules/songs/application/use-cases/get-song-by-id.usecase';
import { RegisterSongRequestDto } from '../dto/requests/register-song-request.dto';
import { SongResponseDto } from '../dto/responses/song-response.dto';
import { SongMapper } from '@modules/songs/infrastructure/mappers/song.mapper';
import { JwtGuard } from '@modules/auth/infrastructure/guards/jwt.guard';

@ApiTags('Songs')
@Controller('songs')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class SongsController {
  constructor(
    private readonly registerSongBySpotifyIdUseCase: RegisterSongBySpotifyIdUseCase,
    private readonly getSongByIdUseCase: GetSongByIdUseCase,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Fetch and register songs by Spotify ID',
    description:
      'Fetches recommendations from ReccoBeats using a Spotify ID as seed, enriches them with emotion analysis and metadata, then registers them in the database. Filters out sad songs.',
  })
  @ApiResponse({
    status: 201,
    description: 'Songs successfully fetched and registered',
    type: [SongResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async registerSong(
    @Body() dto: RegisterSongRequestDto,
  ): Promise<SongResponseDto[]> {
    const songs = await this.registerSongBySpotifyIdUseCase.execute(
      dto.spotifyId,
      dto.targetCount,
    );

    return songs.map((song) => SongMapper.toResponseDto(song));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get song by ID',
    description: 'Retrieves a song by its database ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Song ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Song found',
    type: SongResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Song not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getSongById(@Param('id') id: string): Promise<SongResponseDto> {
    const song = await this.getSongByIdUseCase.execute(id);
    return SongMapper.toResponseDto(song);
  }
}
