import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class SeedLocalQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsEnum(['0', '1', '2', '3'])
  label?: string;
}
