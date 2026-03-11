import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'failed_spotify_tracks' })
export class FailedSpotifyTrackOrmEntity {
  @Prop({ required: true, unique: true, index: true })
  spotifyId: string;

  @Prop({
    required: true,
    enum: ['not_found', 'emotion_error', 'details_error'],
  })
  reason: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const FailedSpotifyTrackSchema = SchemaFactory.createForClass(
  FailedSpotifyTrackOrmEntity,
);
