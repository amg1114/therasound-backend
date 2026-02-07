import { UserResponseDto } from '@modules/users/presentation/dto/responses/user-response.dto';
import { UserPreferencesResponseDto } from '@modules/users/presentation/dto/responses/user-preferences-response.dto';
import { PlaylistSummaryResponseDto } from '@modules/playlists/presentation/dto/responses/playlist-summary-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ type: String })
  accessToken: string;

  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: () => UserPreferencesResponseDto })
  userPreferences: UserPreferencesResponseDto;

  @ApiProperty({
    type: () => [PlaylistSummaryResponseDto],
    description: 'Últimas 5 listas de reproducción del usuario',
  })
  recentPlaylists: PlaylistSummaryResponseDto[];
}
