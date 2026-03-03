import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsStrongPassword } from 'class-validator';

@ApiSchema({
  description: 'DTO para cambiar la contraseña de un usuario',
})
export class ChangePasswordRequestDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario',
    example: 'OldP@ssw0rd!123',
  })
  @IsStrongPassword()
  oldPassword: string;

  @ApiProperty({
    description: 'Nueva contraseña del usuario',
    example: 'NewP@ssw0rd!456',
  })
  @IsStrongPassword()
  newPassword: string;
}
