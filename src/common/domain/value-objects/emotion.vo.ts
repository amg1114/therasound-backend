import { BadRequestException } from '@nestjs/common';

export class EmotionVO {
  public static SONG_EMOTIONS = ['happy', 'sad', 'energetic', 'calm'] as const;

  private constructor(private readonly value: EmotionType) {}

  public static create(emotion: string): EmotionVO {
    if (!this.SONG_EMOTIONS.includes(emotion as EmotionType)) {
      throw new BadRequestException(`Emoción de canción inválida: ${emotion}`);
    }

    return new EmotionVO(emotion as EmotionType);
  }

  equals(other: EmotionVO | string): boolean {
    if (other instanceof EmotionVO) {
      return this.value === other.value;
    }
    return this.value === other;
  }

  getValue(): EmotionType {
    return this.value;
  }
}

export type EmotionType = (typeof EmotionVO.SONG_EMOTIONS)[number];
