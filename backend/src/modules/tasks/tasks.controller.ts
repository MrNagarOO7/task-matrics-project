import {
  Controller,
  UseGuards,
  Request,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  FilterTaskDto,
  MetricsTaskDto,
} from './dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.addTask(createTaskDto);
  }

  @Get()
  list(@Request() req, @Query() filterTaskDto: FilterTaskDto) {
    return this.tasksService.listTask(filterTaskDto);
  }

  @Get('metrics')
  metrics(@Request() req, @Query() metricsTaskDto: MetricsTaskDto) {
    return this.tasksService.metricsTask(metricsTaskDto);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.removeTask(id);
  }
}
