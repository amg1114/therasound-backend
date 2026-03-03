import type { ContentPreferences } from '@modules/users/domain/entities/types/content-preference.type';
import { HistorySongVO } from '@modules/users/domain/value-objects/history-song.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  collection: 'user_preferences',
  timestamps: true,
})
export class MongoUserPreferencesEntity extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'users', unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Object })
  likes: ContentPreferences;

  @Prop({ required: true, type: Object })
  dislikes: ContentPreferences;

  @Prop({ required: true })
  listenedHistory: HistorySongVO[];
}

export const UserPreferencesSchema = SchemaFactory.createForClass(
  MongoUserPreferencesEntity,
);
