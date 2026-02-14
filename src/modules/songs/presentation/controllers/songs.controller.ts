import { JwtGuard } from '@modules/auth/infrastructure/guards/jwt.guard';
import { GetSongByIdUseCase } from '@modules/songs/application/use-cases/get-song-by-id.usecase';
import { GetTopLikedSongsByGenreUseCase } from '@modules/songs/application/use-cases/get-top-liked-songs-by-genre.usecase';
import { SongMapper } from '@modules/songs/infrastructure/mappers/song.mapper';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SongResponseDto } from '../dto/responses/song-response.dto';

@ApiTags('Songs')
@Controller('songs')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class SongsController {
  constructor(
    private readonly getSongByIdUseCase: GetSongByIdUseCase,
    private readonly getTopLikedSongsByGenreUseCase: GetTopLikedSongsByGenreUseCase,
  ) {}

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

  @Get('top/liked')
  @ApiOperation({
    summary: 'Get top liked songs',
    description:
      'Retrieves the top 5 most liked songs. Optionally filter by genre using query parameter.',
  })
  @ApiQuery({
    name: 'genre',
    description: 'Filter by genre (optional)',
    required: false,
    example: 'Pop',
  })
  @ApiResponse({
    status: 200,
    description: 'Top liked songs successfully retrieved',
    type: [SongResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getTopLikedSongs(
    @Query('genre') genre?: string,
  ): Promise<SongResponseDto[]> {
    const songs = await this.getTopLikedSongsByGenreUseCase.execute(genre, 5);
    return songs.map((song) => SongMapper.toResponseDto(song));
  }
}
