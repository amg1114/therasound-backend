import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { type AudioFeaturesVO } from '@modules/songs/domain/value-objects/audio-features.vo';
import { type EmotionDistancesVO } from '@modules/songs/domain/value-objects/emotion-distances.vo';
import { type EmotionProbabilitiesVO } from '@modules/songs/domain/value-objects/emotion-probabilities.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  collection: 'songs',
  timestamps: true,
})
export class SongEntityORM extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  spotifyId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  artist: string;

  @Prop({ required: true, enum: EmotionVO.SONG_EMOTIONS })
  emotion: string;

  @Prop({ required: true })
  durationMs: number;

  @Prop({ required: true })
  spotifyUrl: string;

  @Prop({ required: true, type: [String] })
  genres: string[];

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  releaseDate: Date;

  // Emotion analysis data
  @Prop({ required: true, type: Object })
  audioFeatures: AudioFeaturesVO;

  @Prop({ required: true, type: Object })
  emotionProbabilities: EmotionProbabilitiesVO;

  @Prop({ required: true, type: Object })
  emotionDistances: EmotionDistancesVO;

  @Prop({ required: false, unique: true, index: true })
  reccobeatsId?: string;

  // Statistics
  @Prop({ required: true, default: 0 })
  likesCount: number;

  @Prop({ required: true, default: 0 })
  skipCount: number;

  @Prop({ required: true, default: 0 })
  playCount: number;

  @Prop({ required: true, default: 0 })
  averageCompletionRate: number;
}

export const SongSchema = SchemaFactory.createForClass(SongEntityORM);
