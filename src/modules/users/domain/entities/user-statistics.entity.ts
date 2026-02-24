interface UserStatisticsEntityProps {
  id: string;
  userId: string;
  totalPlaylists: number;
  totalListeningTimeMs: number;
  lastListeningDate: Date | null;
  streakActivationDate: Date | null;
}

export class UserStatisticsEntity implements UserStatisticsEntityProps {
  id: string;
  userId: string;
  totalPlaylists: number;
  totalListeningTimeMs: number;
  lastListeningDate: Date | null;
  streakActivationDate: Date | null;

  constructor(props: UserStatisticsEntityProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.totalPlaylists = props.totalPlaylists;
    this.totalListeningTimeMs = props.totalListeningTimeMs;
    this.lastListeningDate = props.lastListeningDate;
    this.streakActivationDate = props.streakActivationDate;
  }

  static create(userId: string): Partial<UserStatisticsEntity> {
    return {
      userId,
      totalPlaylists: 0,
      totalListeningTimeMs: 0,
      lastListeningDate: null,
      streakActivationDate: null,
    };
  }

  static reconstitute(props: UserStatisticsEntityProps): UserStatisticsEntity {
    return new UserStatisticsEntity(props);
  }

  getValues(): UserStatisticsEntityProps {
    return {
      id: this.id,
      userId: this.userId,
      totalPlaylists: this.totalPlaylists,
      totalListeningTimeMs: this.totalListeningTimeMs,
      lastListeningDate: this.lastListeningDate,
      streakActivationDate: this.streakActivationDate,
    };
  }
}
