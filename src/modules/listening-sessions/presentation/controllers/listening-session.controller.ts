import { ApiEndpoint } from '@common/infrastructure/decorators';
import { UpdateListeningSessionUseCase } from '@modules/listening-sessions/application/use-cases/update-listening-session.usecase';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateListeningSessionDto } from '../dto/requests/update-listening-session.dto';

@Controller('listening-sessions')
@ApiBearerAuth()
export class ListeningSessionController {
  constructor(
    private readonly updateListeningSessionUseCase: UpdateListeningSessionUseCase,
  ) {}

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpoint({
    summary: 'Update a listening session',
    description:
      'Updates the details of an existing listening session, including completion rate, final anxiety level, and abandonment status.',
    body: {
      type: UpdateListeningSessionDto,
      description: 'The details to update for the listening session.',
      required: true,
    },
    params: [
      {
        name: 'id',
        description: 'The ID of the listening session to update.',
        required: true,
      },
    ],
    responses: [
      {
        status: HttpStatus.NO_CONTENT,
        description: 'Listening session updated successfully.',
      },
      {
        status: HttpStatus.NOT_FOUND,
        description: 'Listening session not found.',
      },
    ],
  })
  async updateListeningSession(
    @Param('id', new ParseObjectIdPipe())
    sessionId: string,
    @Body()
    dto: UpdateListeningSessionDto,
  ) {
    await this.updateListeningSessionUseCase.execute(sessionId, dto);
  }
}
