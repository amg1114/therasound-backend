import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  collection: 'users',
  timestamps: true,
})
export class UserEntityORM extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;
  @Prop({ required: true, alias: 'bornAt' })
  birthDate: Date;
  bornAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserEntityORM);
