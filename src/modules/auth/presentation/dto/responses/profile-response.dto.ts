import { IPlaylistSummary } from '@modules/playlists/application/interfaces';
import {
  UserPreferencesResponseDto,
  UserResponseDto,
  UserStatisticsResponseDto,
} from '@modules/users/presentation/dto/responses';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: () => UserPreferencesResponseDto })
  preferences: UserPreferencesResponseDto;

  @ApiProperty({ type: () => UserStatisticsResponseDto })
  statistics: UserStatisticsResponseDto;

  @ApiProperty({
    isArray: true,
    description: 'Últimas 5 listas de reproducción del usuario',
  })
  recentPlaylists: IPlaylistSummary[];
}
