import mongoose, { Document, Schema } from 'mongoose'; // Importing mongoose and its types for creating schemas and documents

// Defining an interface for the Project model that extends mongoose Document
export interface IProject extends Document {
  name: string; // Project name
  description: string; // Project description
}

// Creating a schema for the Project model
const projectSchema: Schema = new Schema({
  name: { type: String, required: true }, // Name field, required
  description: { type: String, required: true }, // Description field, required
});

// Creating the Project model using the schema and the IProject interface
const Project = mongoose.model<IProject>('Project', projectSchema);

// Exporting the Project model for use in other parts of the application
export default Project;
