import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsStrongPassword } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'StrongPassword@123',
  })
  @IsStrongPassword(
    {},
    {
      message:
        'La contraseña debe ser segura (minúsculas, mayúsculas, números y símbolos)',
    },
  )
  password: string;
}
