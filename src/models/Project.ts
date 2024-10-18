import mongoose, { Document, Schema } from 'mongoose';

// Defining an interface for the Project model that extends mongoose Document
export interface IProject extends Document {
  name: string;
  description: string;
}

// Creating a schema for the Project model
const projectSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});

// Creating the Project model using the schema and the IProject interface
const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project;
