export interface ListeningSessionProps {
  id: string;
  userId: string;
  playlistId: string;
  completionRate: number | null;
  initialAnxietyLevel: number;
  finalAnxietyLevel: number | null;
  abandoned: boolean;
}

export type CreateListeningSessionProps = Omit<
  ListeningSessionProps,
  'id' | 'finalAnxietyLevel' | 'abandoned' | 'completionRate'
>;

export class ListeningSessionEntity implements ListeningSessionProps {
  id: string;
  userId: string;
  playlistId: string;
  completionRate: number | null;
  initialAnxietyLevel: number;
  finalAnxietyLevel: number | null;
  abandoned: boolean;

  private constructor(props: ListeningSessionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.playlistId = props.playlistId;
    this.completionRate = props.completionRate;
    this.initialAnxietyLevel = props.initialAnxietyLevel;
    this.finalAnxietyLevel = props.finalAnxietyLevel;
    this.abandoned = props.abandoned;
  }

  static create(
    props: Pick<
      ListeningSessionProps,
      'userId' | 'playlistId' | 'initialAnxietyLevel'
    >,
  ): CreateListeningSessionProps {
    return {
      userId: props.userId,
      playlistId: props.playlistId,
      initialAnxietyLevel: props.initialAnxietyLevel,
    };
  }

  static reconstruct(props: ListeningSessionProps): ListeningSessionEntity {
    return new ListeningSessionEntity(props);
  }
}
