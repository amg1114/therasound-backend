import { UserResponseDto } from '@modules/users/presentation/dto/responses/user-response.dto';
import { UserPreferencesResponseDto } from '@modules/users/presentation/dto/responses/user-preferences-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ type: String })
  accessToken: string;

  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: () => UserPreferencesResponseDto })
  userPreferences: UserPreferencesResponseDto;
}
