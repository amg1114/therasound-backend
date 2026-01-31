import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SongEntityORM } from '@modules/songs/infrastructure/orm/entities/song-entity.orm';

@Schema({
  collection: 'user_preferences',
  timestamps: true,
})
export class UserPreferencesEntityORM extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'users' })
  user: Types.ObjectId;

  @Prop({ required: true, type: [Types.ObjectId], ref: 'songs' })
  likedSongs: Types.ObjectId[];

  @Prop({ required: true, type: [Types.ObjectId], ref: 'songs' })
  dislikedSongs: Types.ObjectId[];

  @Prop({ required: true, type: [String] })
  dislikedGenres: string[];

  @Prop({ required: true, type: [String] })
  dislikedArtists: string[];
}

export const UserPreferencesSchema = SchemaFactory.createForClass(
  UserPreferencesEntityORM,
);
