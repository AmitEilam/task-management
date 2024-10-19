import mongoose, { Schema } from 'mongoose';
import { ITask } from '../interfaces/task';

// Creating a schema for the Task model
const taskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    required: true,
  },
  projectId: { type: String, required: true },
  userId: { type: String, required: true },
});

// Creating the Task model using the schema and the ITask interface
const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task;
