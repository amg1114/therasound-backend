import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterSongBySpotifyIdUseCase } from '@modules/songs/application/use-cases/register-song-by-spotify-id.usecase';
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
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a song by Spotify ID',
    description:
      'Fetches song metadata and emotion analysis, then registers the song in the database. Returns existing song if already registered.',
  })
  @ApiResponse({
    status: 201,
    description: 'Song successfully registered',
    type: SongResponseDto,
  })
  @ApiResponse({
    status: 404,
    description:
      'Song could not be processed (sad emotion or metadata unavailable)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async registerSong(
    @Body() dto: RegisterSongRequestDto,
  ): Promise<SongResponseDto> {
    const song = await this.registerSongBySpotifyIdUseCase.execute(
      dto.spotifyId,
      dto.emotion,
    );

    return SongMapper.toResponseDto(song);
  }
}
