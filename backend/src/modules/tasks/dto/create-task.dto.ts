import { ApiHideProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export enum TaskType {
  OPEN = 'open',
  IN_PROGRESS = 'inprogress',
  COMPLETED = 'completed',
}

export class CreateTaskDto {
  @ApiHideProperty()
  @IsOptional()
  @IsString()
  taskId: string;

  @IsString()
  title: string;

  @IsString()
  desc: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  status: string;
}
