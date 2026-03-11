import {
  LISTENING_SESSION_REPOSITORY,
  type ListeningSessionRepository,
} from '@modules/listening-sessions/domain/repositories';
import { UpdateListeningSessionDto } from '@modules/listening-sessions/presentation/dto/requests/update-listening-session.dto';
import {
  type IPlaylistRepository,
  PLAYLIST_REPOSITORY,
} from '@modules/playlists/domain/repositories/playlist-repository.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UpdateListeningSessionUseCase {
  constructor(
    @Inject(LISTENING_SESSION_REPOSITORY)
    private readonly listeningSessionRepository: ListeningSessionRepository,
    @Inject(PLAYLIST_REPOSITORY)
    private readonly playlistRepository: IPlaylistRepository,
  ) {}

  async execute(sessionId: string, dto: UpdateListeningSessionDto) {
    const session = await this.listeningSessionRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundException('Listening session not found');
    }

    session.completionRate = dto.completionRate;
    session.finalAnxietyLevel = dto.finalAnxietyLevel;
    session.abandoned = dto.abandoned;

    await this.listeningSessionRepository.save(session);
  }
}
