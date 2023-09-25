import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskType } from './create-task.dto';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  desc: string;

  @ApiProperty({
    enum: TaskType,
    isArray: true,
    example: Object.values(TaskType),
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(TaskType)
  status: TaskType;
}
