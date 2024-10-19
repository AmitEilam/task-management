import { Document } from 'mongoose';

// Defining an interface for the Project model that extends mongoose Document
export interface IProject extends Document {
  name: string;
  description: string;
  userId: string;
}
