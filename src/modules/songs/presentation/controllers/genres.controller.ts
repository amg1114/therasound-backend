import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { GetAllGenresUseCase } from '@modules/songs/application/use-cases/get-all-genres.usecase';
import { GetGenreByIdUseCase } from '@modules/songs/application/use-cases/get-genre-by-id.usecase';
import { GenreResponseDto } from '../dto/responses/genre-response.dto';
import { JwtGuard } from '@modules/auth/infrastructure/guards/jwt.guard';

@ApiTags('Genres')
@Controller('genres')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class GenresController {
  constructor(
    private readonly getAllGenresUseCase: GetAllGenresUseCase,
    private readonly getGenreByIdUseCase: GetGenreByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all genres',
    description: 'Retrieves all genres with their song counts',
  })
  @ApiResponse({
    status: 200,
    description: 'Genres successfully retrieved',
    type: [GenreResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getAllGenres(): Promise<GenreResponseDto[]> {
    const genres = await this.getAllGenresUseCase.execute();
    return genres.map((genre) => ({
      id: genre.id,
      name: genre.name,
      songsCount: genre.songsCount,
    }));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get genre by ID',
    description: 'Retrieves a genre by its database ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Genre ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Genre successfully retrieved',
    type: GenreResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Genre not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getGenreById(@Param('id') id: string): Promise<GenreResponseDto> {
    const genre = await this.getGenreByIdUseCase.execute(id);
    return {
      id: genre.id,
      name: genre.name,
      songsCount: genre.songsCount,
    };
  }
}
