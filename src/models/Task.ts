import mongoose, { Document, Schema } from 'mongoose';

// Defining an interface for the Task model that extends mongoose Document
export interface ITask extends Document {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  projectId: string;
  userId: string;
}

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
