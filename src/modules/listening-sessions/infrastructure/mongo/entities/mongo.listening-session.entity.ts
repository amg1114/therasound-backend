import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'listening_sessions' })
export class MongoListeningSessionEntity extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  playlistId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  initialAnxietyLevel: number;

  @Prop({ default: null, required: false, type: Number })
  finalAnxietyLevel: number | null;

  @Prop({ default: null, required: false, type: Number })
  completionRate: number | null;

  @Prop({ default: false })
  abandoned: boolean;
}

export const ListeningSessionSchema = SchemaFactory.createForClass(
  MongoListeningSessionEntity,
);
