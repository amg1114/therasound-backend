import { ApiEndpoint } from '@common/infrastructure/decorators';
import { JwtGuard } from '@modules/auth/infrastructure/guards/jwt.guard';
import { GetSongByIdUseCase } from '@modules/songs/application/use-cases/get-song-by-id.usecase';
import { SongMapper } from '@modules/songs/infrastructure/mappers/song.mapper';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SongResponseDto } from '../dto/responses/song-response.dto';

@ApiTags('Songs')
@Controller('songs')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class SongsController {
  constructor(private readonly getSongByIdUseCase: GetSongByIdUseCase) {}

  @Get(':id')
  @ApiEndpoint({
    summary: 'Get song by ID',
    description:
      'Retrieves detailed information about a specific song by its ID.',
    params: [
      {
        name: 'id',
        description: 'The unique identifier of the song',
        required: true,
        type: String,
      },
    ],
    responses: [
      {
        status: 200,
        description: 'The song details',
        type: SongResponseDto,
      },
      {
        status: 404,
        description: 'Song not found',
      },
    ],
  })
  async getSongById(@Param('id') id: string): Promise<SongResponseDto> {
    const song = await this.getSongByIdUseCase.execute(id);
    return SongMapper.toResponseDto(song);
  }
}
