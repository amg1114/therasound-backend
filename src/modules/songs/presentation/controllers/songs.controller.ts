import { JwtGuard } from '@modules/auth/infrastructure/guards/jwt.guard';
import { GetSongByIdUseCase } from '@modules/songs/application/use-cases/get-song-by-id.usecase';
import { SongMapper } from '@modules/songs/infrastructure/mappers/song.mapper';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SongResponseDto } from '../dto/responses/song-response.dto';

@ApiTags('Songs')
@Controller('songs')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class SongsController {
  constructor(private readonly getSongByIdUseCase: GetSongByIdUseCase) {}

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
