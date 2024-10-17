import mongoose, { Document, Schema } from 'mongoose'; // Importing mongoose and its types for creating schemas and documents

// Defining an interface for the Task model that extends mongoose Document
export interface ITask extends Document {
  title: string; // Title of the task
  description: string; // Description of the task
  status: 'todo' | 'in-progress' | 'done'; // Status of the task with specific allowed values
  projectId: string; // ID of the project to which the task belongs
}

// Creating a schema for the Task model
const taskSchema: Schema = new Schema({
  title: { type: String, required: true }, // Title field, required
  description: { type: String, required: true }, // Description field, required
  status: {
    type: String, // Status field
    enum: ['todo', 'in-progress', 'done'], // Allowed values for the status
    required: true, // This field is required
  },
  projectId: { type: String, required: true }, // Project ID field, required
});

// Creating the Task model using the schema and the ITask interface
const Task = mongoose.model<ITask>('Task', taskSchema);

// Exporting the Task model for use in other parts of the application
export default Task;
