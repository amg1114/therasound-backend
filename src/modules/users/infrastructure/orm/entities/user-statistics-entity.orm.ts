import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  collection: 'user_statistics',
  timestamps: true,
})
export class UserStatisticsEntityORM {
  declare _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'users', unique: true })
  userId: string;

  @Prop({ required: false, default: 0 })
  totalPlaylists: number;

  @Prop({ required: false, default: 0 })
  totalListeningTimeMs: number;

  @Prop({ required: false, default: null })
  lastListeningDate: Date | null;

  @Prop({ required: false, default: null })
  streakActivationDate: Date | null;
}

export const UserStatisticsSchema = SchemaFactory.createForClass(
  UserStatisticsEntityORM,
);
