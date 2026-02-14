import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Embedded song schema for playlists
class EmbeddedSong {
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

  @Prop({ required: true, type: Types.ObjectId })
  songId: Types.ObjectId;
}

@Schema({
  collection: 'playlists',
  timestamps: true,
})
export class PlaylistEntityORM extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'users' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: [EmbeddedSong] })
  songs: EmbeddedSong[];

  @Prop({ required: true, enum: EmotionVO.SONG_EMOTIONS })
  emotion: string;

  @Prop({ required: true })
  durationMs: number;

  @Prop({ type: Date })
  createdAt: Date;
}

export const PlaylistSchema = SchemaFactory.createForClass(PlaylistEntityORM);
