import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  collection: 'genres',
  timestamps: true,
})
export class GenreEntityORM extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, default: 0 })
  songsCount: number;
}

export const GenreSchema = SchemaFactory.createForClass(GenreEntityORM);
