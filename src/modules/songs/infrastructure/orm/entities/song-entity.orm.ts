import { SongEmotionVO } from '@modules/songs/domain/value-objects/song-emotion.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class AudioFeaturesORM {
  @Prop({ required: false })
  acousticness?: number;

  @Prop({ required: false })
  danceability?: number;

  @Prop({ required: false })
  energy?: number;

  @Prop({ required: false })
  instrumentalness?: number;

  @Prop({ required: false })
  liveness?: number;

  @Prop({ required: false })
  loudness?: number;

  @Prop({ required: false })
  speechiness?: number;

  @Prop({ required: false })
  tempo?: number;

  @Prop({ required: false })
  valence?: number;
}

export class EmotionProbabilitiesORM {
  @Prop({ required: false })
  calm?: number;

  @Prop({ required: false })
  energetic?: number;

  @Prop({ required: false })
  happy?: number;

  @Prop({ required: false })
  sad?: number;
}

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

  @Prop({ required: true, enum: SongEmotionVO.SONG_EMOTIONS })
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
  @Prop({ required: false, type: AudioFeaturesORM })
  audioFeatures?: AudioFeaturesORM;

  @Prop({ required: false })
  emotionConfidence?: number;

  @Prop({ required: false, type: EmotionProbabilitiesORM })
  emotionProbabilities?: EmotionProbabilitiesORM;

  @Prop({ required: false, index: true })
  reccobeatsId?: string;
}

export const SongSchema = SchemaFactory.createForClass(SongEntityORM);
