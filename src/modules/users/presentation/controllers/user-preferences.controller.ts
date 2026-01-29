import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserPreferencesUseCase } from '@modules/users/application/use-cases/create-user-preferences.usecase';
import { GetUserPreferencesUseCase } from '@modules/users/application/use-cases/get-user-preferences.usecase';
import { UpdateLikedSongsUseCase } from '@modules/users/application/use-cases/update-liked-songs.usecase';
import { UpdateDislikedSongsUseCase } from '@modules/users/application/use-cases/update-disliked-songs.usecase';
import { UpdateDislikedGenresUseCase } from '@modules/users/application/use-cases/update-disliked-genres.usecase';
import { UpdateDislikedArtistsUseCase } from '@modules/users/application/use-cases/update-disliked-artists.usecase';
import { UpdateLikedSongsRequestDto } from '../dto/requests/update-liked-songs-request.dto';
import { UpdateDislikedSongsRequestDto } from '../dto/requests/update-disliked-songs-request.dto';
import { UpdateDislikedGenresRequestDto } from '../dto/requests/update-disliked-genres-request.dto';
import { UpdateDislikedArtistsRequestDto } from '../dto/requests/update-disliked-artists-request.dto';
import { UserPreferencesResponseDto } from '../dto/responses/user-preferences-response.dto';
import { UserPreferencesMapper } from '@modules/users/infrastructure/mappers/user-preferences.mapper';
import { CurrentUserId } from '@modules/auth/infrastructure/decorators/current-user.decorator';

/**
 * Controller for managing user preferences
 * Handles operations related to user's liked/disliked songs, genres, and artists
 * All endpoints require authentication and operate on the authenticated user's preferences
 */
@ApiTags('User Preferences')
@Controller('preferences')
@ApiBearerAuth()
export class UserPreferencesController {
  constructor(
    private readonly createUserPreferencesUseCase: CreateUserPreferencesUseCase,
    private readonly getUserPreferencesUseCase: GetUserPreferencesUseCase,
    private readonly updateLikedSongsUseCase: UpdateLikedSongsUseCase,
    private readonly updateDislikedSongsUseCase: UpdateDislikedSongsUseCase,
    private readonly updateDislikedGenresUseCase: UpdateDislikedGenresUseCase,
    private readonly updateDislikedArtistsUseCase: UpdateDislikedArtistsUseCase,
  ) {}

  @ApiOperation({
    summary: 'Create user preferences',
    description:
      'Initializes preferences for the authenticated user. Creates an empty preference structure with empty arrays for liked/disliked items.',
  })
  @ApiResponse({
    status: 201,
    description: 'User preferences created successfully',
    type: UserPreferencesResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User preferences already exist for this user',
  })
  @Post()
  async createPreferences(
    @CurrentUserId() userId: string,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.createUserPreferencesUseCase.execute(userId);
    return UserPreferencesMapper.toResponseDto(preferences);
  }

  @ApiOperation({
    summary: 'Get user preferences',
    description:
      'Retrieves all preferences for the authenticated user including liked/disliked songs, genres, and artists.',
  })
  @ApiResponse({
    status: 200,
    description: 'User preferences retrieved successfully',
    type: UserPreferencesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User preferences not found',
  })
  @Get()
  async getPreferences(
    @CurrentUserId() userId: string,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.getUserPreferencesUseCase.execute(userId);
    return UserPreferencesMapper.toResponseDto(preferences);
  }

  @ApiOperation({
    summary: 'Update liked songs',
    description:
      'Add or remove a song from the authenticated user\'s liked songs list. Use action "add" to like a song or "remove" to unlike it.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liked songs updated successfully',
    type: UserPreferencesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User preferences not found',
  })
  @Patch('liked-songs')
  async updateLikedSongs(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateLikedSongsRequestDto,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.updateLikedSongsUseCase.execute(userId, dto);
    return UserPreferencesMapper.toResponseDto(preferences);
  }

  @ApiOperation({
    summary: 'Update disliked songs',
    description:
      'Add or remove a song from the authenticated user\'s disliked songs list. Use action "add" to dislike a song or "remove" to remove from dislikes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Disliked songs updated successfully',
    type: UserPreferencesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User preferences not found',
  })
  @Patch('disliked-songs')
  async updateDislikedSongs(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateDislikedSongsRequestDto,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.updateDislikedSongsUseCase.execute(
      userId,
      dto,
    );
    return UserPreferencesMapper.toResponseDto(preferences);
  }

  @ApiOperation({
    summary: 'Update disliked genres',
    description:
      'Add or remove a genre from the authenticated user\'s disliked genres list. Use action "add" to dislike a genre or "remove" to remove from dislikes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Disliked genres updated successfully',
    type: UserPreferencesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User preferences not found',
  })
  @Patch('disliked-genres')
  async updateDislikedGenres(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateDislikedGenresRequestDto,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.updateDislikedGenresUseCase.execute(
      userId,
      dto,
    );
    return UserPreferencesMapper.toResponseDto(preferences);
  }

  @ApiOperation({
    summary: 'Update disliked artists',
    description:
      'Add or remove an artist from the authenticated user\'s disliked artists list. Use action "add" to dislike an artist or "remove" to remove from dislikes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Disliked artists updated successfully',
    type: UserPreferencesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User preferences not found',
  })
  @Patch('disliked-artists')
  async updateDislikedArtists(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateDislikedArtistsRequestDto,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.updateDislikedArtistsUseCase.execute(
      userId,
      dto,
    );
    return UserPreferencesMapper.toResponseDto(preferences);
  }
}
