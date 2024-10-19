import mongoose, { Schema } from 'mongoose';
import { IProject } from '../interfaces/project';

// Creating a schema for the Project model
const projectSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: String, required: true },
});

// Creating the Project model using the schema and the IProject interface
const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project;
