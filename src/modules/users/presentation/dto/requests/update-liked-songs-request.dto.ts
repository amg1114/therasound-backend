import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

/**
 * DTO for updating liked songs preferences
 * Allows adding or removing a song from the user's liked songs list
 */
export class UpdateLikedSongsRequestDto {
  @ApiProperty({
    description: 'ID of the song to add or remove from liked songs',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({
    message: 'El ID de la canción debe ser un ID de MongoDB válido',
  })
  @IsNotEmpty({ message: 'El ID de la canción es requerido' })
  songId: string;

  @ApiProperty({
    description: 'Action to perform: add song to liked list or remove from it',
    enum: ['add', 'remove'],
    example: 'add',
  })
  @IsEnum(['add', 'remove'], { message: 'La acción debe ser "add" o "remove"' })
  @IsNotEmpty({ message: 'La acción es requerida' })
  action: 'add' | 'remove';
}
