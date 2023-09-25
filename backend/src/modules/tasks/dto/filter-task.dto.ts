import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class FilterTaskDto {
  @IsNumber()
  @IsNotEmpty()
  pages: number;

  @IsNumber()
  @IsNotEmpty()
  counts: number;
}
