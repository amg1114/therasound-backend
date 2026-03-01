import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

@ApiSchema({ description: 'Data Transfer Object for updating user profile' })
export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'The name of the user' })
  name: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({ description: 'The email of the user' })
  email: string;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  @ApiPropertyOptional({ description: 'The birth date of the user' })
  bornAt: Date;
}
