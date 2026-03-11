import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

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

  @ApiProperty({
    description: 'Date of birth of the user',
    example: '1990-01-01',
  })
  @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida' })
  @Type(() => Date)
  bornAt: Date;
}
