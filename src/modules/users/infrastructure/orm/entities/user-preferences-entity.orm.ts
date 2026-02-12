import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';
import { HistorySongVO } from '@modules/users/domain/value-objects/history-song.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  collection: 'user_preferences',
  timestamps: true,
})
export class UserPreferencesEntityORM extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'users', unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  likedSongs: SongSummaryVO[];

  @Prop({ required: true })
  dislikedSongs: SongSummaryVO[];

  @Prop({ required: true })
  likedGenres: string[];

  @Prop({ required: true })
  dislikedGenres: string[];

  @Prop({ required: true })
  dislikedArtists: string[];

  @Prop({ required: true })
  likedArtists: string[];

  @Prop({ required: true })
  listenedHistory: HistorySongVO[];
}

export const UserPreferencesSchema = SchemaFactory.createForClass(
  UserPreferencesEntityORM,
);
