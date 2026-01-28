import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  collection: 'genres',
  timestamps: true,
})
export class GenreEntityORM extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;
}
