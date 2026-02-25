import { IAuthUseCaseResult } from '@modules/auth/application/use-cases/interfaces';
import { AuthResponseDto } from '@modules/auth/presentation/dto/responses/auth-response.dto';

export class AuthMapper {
  static toAuthResponse(result: IAuthUseCaseResult): AuthResponseDto {
    const response = new AuthResponseDto();

    response.accessToken = result.accessToken;

    return response;
  }
}
