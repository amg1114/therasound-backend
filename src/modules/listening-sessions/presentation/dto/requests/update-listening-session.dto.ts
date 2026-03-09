import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateListeningSessionDto {
  @ApiProperty({
    description:
      'The completion rate of the listening session, represented as a percentage (0-100).',
  })
  @IsNumber()
  @IsOptional()
  completionRate: number | null;

  @ApiProperty({
    description:
      'The final anxiety level of the user after the listening session, represented as a number.',
  })
  @IsNumber()
  @IsOptional()
  finalAnxietyLevel: number | null;

  @ApiProperty({
    description: 'Indicates whether the listening session was abandoned.',
  })
  @Type(() => Boolean)
  @IsBoolean()
  abandoned: boolean;
}
