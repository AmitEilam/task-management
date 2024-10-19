import { Document } from 'mongoose';

// Defining an interface for the Task model that extends mongoose Document
export interface ITask extends Document {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  projectId: string;
  userId: string;
}
