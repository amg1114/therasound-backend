import {
  CreateListeningSessionProps,
  ListeningSessionEntity,
} from '../entities';

export const LISTENING_SESSION_REPOSITORY = 'LISTENING_SESSION_REPOSITORY';

export interface ListeningSessionRepository {
  create(data: CreateListeningSessionProps): Promise<ListeningSessionEntity>;

  findById(id: string): Promise<ListeningSessionEntity | null>;

  save(
    listeningSession: ListeningSessionEntity,
  ): Promise<ListeningSessionEntity>;
}
