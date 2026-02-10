import { BadRequestException } from '@nestjs/common';

export class SongEmotionVO {
  public static SONG_EMOTIONS = ['happy', 'sad', 'energetic', 'calm'] as const;

  private constructor(private readonly value: SongEmotionType) {}

  public static create(emotion: string): SongEmotionVO {
    if (!this.SONG_EMOTIONS.includes(emotion as SongEmotionType)) {
      throw new BadRequestException(`Emoción de canción inválida: ${emotion}`);
    }

    return new SongEmotionVO(emotion as SongEmotionType);
  }

  equals(other: SongEmotionVO): boolean {
    return this.value === other.value;
  }

  getValue(): SongEmotionType {
    return this.value;
  }
}

export type SongEmotionType = (typeof SongEmotionVO.SONG_EMOTIONS)[number];
