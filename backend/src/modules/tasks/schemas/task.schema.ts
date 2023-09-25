import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  taskId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  desc: string;

  @Prop({ type: String })
  status: {
    type: string;
    enum: ['open', 'inprogress', 'completed'];
  };
}

export const TaskSchema = SchemaFactory.createForClass(Task);
