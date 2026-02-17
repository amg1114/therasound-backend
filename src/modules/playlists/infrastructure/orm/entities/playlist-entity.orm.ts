import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { EmbeddedSongVO } from '@modules/playlists/domain/value-objects/embedded-song.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  collection: 'playlists',
  timestamps: true,
})
export class PlaylistEntityORM extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'users' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: [Object] })
  songs: EmbeddedSongVO[];

  @Prop({ required: false })
  title?: string;

  @Prop({ required: true, enum: EmotionVO.SONG_EMOTIONS })
  emotion: string;

  @Prop({ required: true })
  durationMs: number;

  @Prop({ type: Date })
  createdAt: Date;
}

export const PlaylistSchema = SchemaFactory.createForClass(PlaylistEntityORM);
