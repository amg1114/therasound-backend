import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  collection: 'artists',
  timestamps: true,
})
export class MongoArtistEntity extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ required: true })
  songsCount: number;

  @Prop({ required: false })
  avatarUrl?: string;
}

export const ArtistSchema = SchemaFactory.createForClass(MongoArtistEntity);
