import { Injectable } from '@nestjs/common';
import {
  CreateTaskDto,
  UpdateTaskDto,
  FilterTaskDto,
  MetricsTaskDto,
} from './dto';
import { Task, TaskDocument } from './schemas/task.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonResponse, randomString } from '../../utility';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}
  async addTask(createTaskDto: CreateTaskDto) {
    try {
      let checkIdExist = true;
      let taskId: string;

      while (checkIdExist) {
        taskId = randomString(8);
        const existTask = await this.taskModel.findOne({ taskId });
        if (!existTask) checkIdExist = false;
      }
      createTaskDto.taskId = taskId;
      createTaskDto.status = createTaskDto?.status
        ? createTaskDto?.status
        : 'open';
      const respData = (
        await new this.taskModel(createTaskDto).save()
      ).toObject();
      return CommonResponse.getSuccessResponse(respData, 'ADD_TASK', 201);
    } catch (error) {
      return CommonResponse.getFailedResponse(null, null, error);
    }
  }

  async listTask(filterTaskDto: FilterTaskDto) {
    try {
      const counts = filterTaskDto.counts || 20;
      const pages = filterTaskDto.pages || 1;
      const skipTotal = counts * (pages - 1);
      const filterCondition = {};

      const filteredData = await this.taskModel.aggregate([
        {
          $match: filterCondition,
        },
        {
          $project: {
            taskId: 1,
            title: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $skip: skipTotal,
        },
        {
          $limit: +counts,
        },
      ]);
      const total = await this.taskModel.count(filterCondition);
      return CommonResponse.getSuccessResponse(
        { filteredData, total },
        'LIST_TASK',
        201,
      );
    } catch (error) {
      return CommonResponse.getFailedResponse(null, null, error);
    }
  }

  async metricsTask(metricsTaskDto: MetricsTaskDto) {
    try {
      const { startDate, endDate } = metricsTaskDto;
      const query = {};

      if (!startDate && !endDate) {
        return CommonResponse.getFailedResponse('NO_RANGE');
      }

      if (startDate && endDate) {
        query['createdAt'] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      } else if (startDate) {
        query['createdAt'] = { $gte: new Date(startDate) };
      } else if (endDate) {
        query['createdAt'] = { $lte: new Date(endDate) };
      }

      const groupedTasks = await this.taskModel.aggregate([
        {
          $match: query,
        },
        {
          $group: {
            _id: {
              status: '$status',
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      const metricsDataMap = {};

      groupedTasks.map((group) => {
        const date = new Date(
          group._id.year,
          group._id.month - 1,
          group._id.day,
        );
        const formattedDate = date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const metricKey = `${group._id.status.toLowerCase()}_tasks`;

        if (!metricsDataMap[formattedDate]) {
          metricsDataMap[formattedDate] = { metrics: {} };
        }

        metricsDataMap[formattedDate]['metrics'][metricKey] = group.count;
      });

      const metricsData = Object.keys(metricsDataMap).map((key) => {
        return {
          date: key,
          metrics: metricsDataMap[key]['metrics'],
        };
      });

      return CommonResponse.getSuccessResponse(
        { metricsData },
        'METRIC_TASK',
        201,
      );
    } catch (error) {
      console.log(error);
      return CommonResponse.getFailedResponse(null, null, error);
    }
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto) {
    try {
      const existTask = await this.taskModel.findOne({ taskId: id }, null, {
        lean: true,
      });
      if (!existTask) return CommonResponse.getFailedResponse('NO_TASK');
      const updateTask = await this.taskModel.findOneAndUpdate(
        { taskId: id },
        updateTaskDto,
        { new: true },
      );
      return CommonResponse.getSuccessResponse(updateTask, 'UPDATE_TASK');
    } catch (error) {
      return CommonResponse.getFailedResponse(null, null, error);
    }
  }

  async removeTask(id: string) {
    try {
      const existTask = await this.taskModel.findOne({ taskId: id }, null, {
        lean: true,
      });
      if (!existTask) return CommonResponse.getFailedResponse('NO_TASK');

      const deleteTask = await this.taskModel.findOneAndDelete({ taskId: id });
      return CommonResponse.getSuccessResponse(deleteTask, 'DELETE_TASK');
    } catch (error) {
      return CommonResponse.getFailedResponse(null, null, error);
    }
  }
}
