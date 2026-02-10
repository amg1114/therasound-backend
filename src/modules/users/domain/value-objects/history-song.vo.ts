interface HistorySongProps {
  songId: string;
  listenedAt: Date;
}

export class HistorySongVO implements HistorySongProps {
  songId: string;
  listenedAt: Date;

  private constructor(props: HistorySongProps) {
    this.songId = props.songId;
    this.listenedAt = props.listenedAt;
  }

  static create(props: HistorySongProps): HistorySongVO {
    return new HistorySongVO(props);
  }
}
