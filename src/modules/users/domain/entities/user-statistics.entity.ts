interface UserStatisticsEntityProps {
  id: string;
  userId: string;
  totalPlaylists: number;
  totalSongsListened: number;
  totalListeningTimeMs: number;
  lastListeningDate: Date | null;
  streakActivationDate: Date | null;
}

export type CreateUserStatisticsProps = Omit<UserStatisticsEntityProps, 'id'>;

export class UserStatisticsEntity implements UserStatisticsEntityProps {
  id: string;
  userId: string;
  totalPlaylists: number;
  totalSongsListened: number;
  totalListeningTimeMs: number;
  lastListeningDate: Date | null;
  streakActivationDate: Date | null;

  constructor(props: UserStatisticsEntityProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.totalPlaylists = props.totalPlaylists;
    this.totalSongsListened = props.totalSongsListened;
    this.totalListeningTimeMs = props.totalListeningTimeMs;
    this.lastListeningDate = props.lastListeningDate;
    this.streakActivationDate = props.streakActivationDate;
  }

  static create(userId: string): CreateUserStatisticsProps {
    return {
      userId,
      totalPlaylists: 0,
      totalSongsListened: 0,
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
      totalSongsListened: this.totalSongsListened,
      totalListeningTimeMs: this.totalListeningTimeMs,
      lastListeningDate: this.lastListeningDate,
      streakActivationDate: this.streakActivationDate,
    };
  }

  updateStreak() {
    const now = new Date();

    if (!this.lastListeningDate) {
      this.streakActivationDate = now;
      this.lastListeningDate = now;
      return;
    }

    const daysSinceLastListening = Math.floor(
      (now.getTime() - this.lastListeningDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (daysSinceLastListening > 1) {
      this.streakActivationDate = now;
      this.lastListeningDate = now;
      return;
    }

    this.lastListeningDate = now;
  }
}
