import { ApiEndpoint } from '@common/infrastructure/decorators';
import { CurrentUserId } from '@modules/auth/infrastructure/decorators/current-user.decorator';
import {
  CreateUserPreferencesUseCase,
  GetUserPreferencesUseCase,
  TogglePreferenceUseCase,
} from '@modules/users/application/use-cases/preferences';
import {
  CONTENT_TYPES,
  type ContentType,
  PREFERENCE_TYPES,
  type PreferenceType,
} from '@modules/users/domain/entities/types/content-preference.type';
import { UserPreferencesMapper } from '@modules/users/infrastructure/mappers/user-preferences.mapper';
import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
    private readonly togglePreferenceUseCase: TogglePreferenceUseCase,
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
    summary: 'Toggle content preferences',
    description:
      "Add or remove an entity from the authenticated user's liked/disliked songs, genres, or artists list.",
    params: [
      {
        name: 'preferenceType',
        description: 'Type of preference to toggle (like or dislike)',
        required: true,
        enum: PREFERENCE_TYPES,
      },
      {
        name: 'contentType',
        description:
          'Type of content to toggle preference for (songs, genres, artists)',
        required: true,
        enum: CONTENT_TYPES,
      },
      {
        name: 'contentId',
        description: 'ID of the content item to toggle preference for',
        required: true,
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Content preferences updated successfully',
        type: UserPreferencesResponseDto,
      },
      {
        status: 404,
        description: 'User preferences not found',
      },
    ],
  })
  @Patch(':preferenceType/:contentType/:contentId')
  async updateContentPreferences(
    @CurrentUserId() userId: string,
    @Param('preferenceType', new ParseEnumPipe(PREFERENCE_TYPES))
    preferenceType: PreferenceType,
    @Param('contentType', new ParseEnumPipe(CONTENT_TYPES))
    contentType: ContentType,
    @Param('contentId') contentId: string,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.togglePreferenceUseCase.execute(
      userId,
      contentType,
      preferenceType,
      contentId,
    );
    return UserPreferencesMapper.toResponseDto(preferences);
  }
}
