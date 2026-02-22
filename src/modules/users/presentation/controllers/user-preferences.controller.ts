import { ApiEndpoint } from '@common/infrastructure/decorators';
import { CurrentUserId } from '@modules/auth/infrastructure/decorators/current-user.decorator';
import { CreateUserPreferencesUseCase } from '@modules/users/application/use-cases/create-user-preferences.usecase';
import { GetUserPreferencesUseCase } from '@modules/users/application/use-cases/get-user-preferences.usecase';
import { ToggleSongPreferencesUseCase } from '@modules/users/application/use-cases/toggle-song-preferences.usecase';
import { UpdateArtistsPreferencesUseCase } from '@modules/users/application/use-cases/update-artists-prefereces.usecase';
import { UpdateGenresPreferencesUseCase } from '@modules/users/application/use-cases/update-genres-preferences.usecase';
import { UserPreferencesMapper } from '@modules/users/infrastructure/mappers/user-preferences.mapper';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateArtistPreferencesRequestDto } from '../dto/requests/update-artist-preferences-request.dto';
import { UpdateGenrePreferencesRequestDto } from '../dto/requests/update-genre-preferences-request.dto';
import { UserPreferencesResponseDto } from '../dto/responses/user-preferences-response.dto';

/**
 * Controller for managing user preferences
 * Handles operations related to user's liked/disliked songs, genres, and artists
 * All endpoints require authentication and operate on the authenticated user's preferences
 */
@ApiTags('User Preferences')
@Controller('user/preferences')
@ApiBearerAuth()
export class UserPreferencesController {
  constructor(
    private readonly createUserPreferencesUseCase: CreateUserPreferencesUseCase,
    private readonly getUserPreferencesUseCase: GetUserPreferencesUseCase,
    private readonly toggleSongPreferencesUseCase: ToggleSongPreferencesUseCase,
    private readonly updateArtistsPreferencesUseCase: UpdateArtistsPreferencesUseCase,
    private readonly updateGenresPreferencesUseCase: UpdateGenresPreferencesUseCase,
  ) {}

  @ApiEndpoint({
    summary: 'Create user preferences',
    description:
      'Initializes preferences for the authenticated user. Creates an empty preference structure with empty arrays for liked/disliked items.',
    responses: [
      {
        status: 201,
        description: 'User preferences created successfully',
        type: UserPreferencesResponseDto,
      },
      {
        status: 409,
        description: 'User preferences already exist for this user',
      },
    ],
  })
  @Post()
  async createPreferences(
    @CurrentUserId() userId: string,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.createUserPreferencesUseCase.execute(userId);
    return UserPreferencesMapper.toResponseDto(preferences);
  }

  @ApiEndpoint({
    summary: 'Get user preferences',
    description:
      'Retrieves all preferences for the authenticated user including liked/disliked songs, genres, and artists.',
    responses: [
      {
        status: 200,
        description: 'User preferences retrieved successfully',
        type: UserPreferencesResponseDto,
      },
      {
        status: 404,
        description: 'User preferences not found',
      },
    ],
  })
  @Get()
  async getPreferences(
    @CurrentUserId() userId: string,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.getUserPreferencesUseCase.execute(userId);
    return UserPreferencesMapper.toResponseDto(preferences);
  }

  @ApiEndpoint({
    summary: 'Toggle liked songs',
    description:
      "Add or remove a song from the authenticated user's liked songs list.",
    params: [{ name: 'songId', description: 'ID of the song to toggle' }],
    responses: [
      {
        status: 200,
        description: 'Liked songs updated successfully',
        type: UserPreferencesResponseDto,
      },
      {
        status: 404,
        description: 'User preferences not found',
      },
    ],
  })
  @Patch('songs/:songId/liked')
  async updateLikedSongs(
    @CurrentUserId() userId: string,
    @Param('songId') songId: string,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.toggleSongPreferencesUseCase.execute(
      userId,
      songId,
      'likedSongs',
    );
    return UserPreferencesMapper.toResponseDto(preferences);
  }

  @ApiEndpoint({
    summary: 'Toggle disliked songs',
    description:
      "Add or remove a song from the authenticated user's disliked songs list.",
    params: [{ name: 'songId', description: 'ID of the song to toggle' }],
    responses: [
      {
        status: 200,
        description: 'Disliked songs updated successfully',
        type: UserPreferencesResponseDto,
      },
      {
        status: 404,
        description: 'User preferences not found',
      },
    ],
  })
  @Patch('songs/:songId/disliked')
  async updateDislikedSongs(
    @CurrentUserId() userId: string,
    @Param('songId') songId: string,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.toggleSongPreferencesUseCase.execute(
      userId,
      songId,
      'dislikedSongs',
    );
    return UserPreferencesMapper.toResponseDto(preferences);
  }

  @ApiEndpoint({
    summary: 'Update liked genres',
    description:
      "Replace the authenticated user's liked genres list with a new list of genres.",
    body: {
      type: UpdateGenrePreferencesRequestDto,
      description: 'List of genre names to set as liked genres',
    },
    responses: [
      {
        status: 200,
        description: 'Liked genres updated successfully',
        type: UserPreferencesResponseDto,
      },
      {
        status: 404,
        description: 'User preferences not found',
      },
    ],
  })
  @Patch('genres/liked')
  async updateLikedGenres(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateGenrePreferencesRequestDto,
  ) {
    const preferences = await this.updateGenresPreferencesUseCase.execute(
      userId,
      'likedGenres',
      dto,
    );

    return UserPreferencesMapper.toResponseDto(preferences);
  }

  @ApiEndpoint({
    summary: 'Update disliked genres',
    description:
      "Replace the authenticated user's disliked genres list with a new list of genres.",
    body: {
      type: UpdateGenrePreferencesRequestDto,
      description: 'List of genre names to set as disliked genres',
    },
    responses: [
      {
        status: 200,
        description: 'Disliked genres updated successfully',
        type: UserPreferencesResponseDto,
      },
      {
        status: 404,
        description: 'User preferences not found',
      },
    ],
  })
  @Patch('genres/disliked')
  async updateDislikedGenres(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateGenrePreferencesRequestDto,
  ) {
    const preferences = await this.updateGenresPreferencesUseCase.execute(
      userId,
      'dislikedGenres',
      dto,
    );

    return UserPreferencesMapper.toResponseDto(preferences);
  }

  @ApiEndpoint({
    summary: 'Update liked artists',
    description:
      "Replace the authenticated user's liked artists list with a new list of artists.",
    body: {
      type: UpdateArtistPreferencesRequestDto,
      description: 'List of artist names to set as liked artists',
    },
    responses: [
      {
        status: 200,
        description: 'Liked artists updated successfully',
        type: UserPreferencesResponseDto,
      },
      {
        status: 404,
        description: 'User preferences not found',
      },
    ],
  })
  @Patch('artists/liked')
  async updateLikedArtists(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateArtistPreferencesRequestDto,
  ) {
    const preferences = await this.updateArtistsPreferencesUseCase.execute(
      userId,
      'likedArtists',
      dto,
    );

    return UserPreferencesMapper.toResponseDto(preferences);
  }

  @ApiEndpoint({
    summary: 'Update disliked artists',
    description:
      "Replace the authenticated user's disliked artists list with a new list of artists.",
    body: {
      type: UpdateArtistPreferencesRequestDto,
      description: 'List of artist names to set as disliked artists',
    },
    responses: [
      {
        status: 200,
        description: 'Disliked artists updated successfully',
        type: UserPreferencesResponseDto,
      },
      {
        status: 404,
        description: 'User preferences not found',
      },
    ],
  })
  @Patch('artists/disliked')
  async updateDislikedArtists(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateArtistPreferencesRequestDto,
  ) {
    const preferences = await this.updateArtistsPreferencesUseCase.execute(
      userId,
      'dislikedArtists',
      dto,
    );

    return UserPreferencesMapper.toResponseDto(preferences);
  }
}
