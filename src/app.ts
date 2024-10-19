import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './config/db';
import projectRoutes from './routes/project';
import taskRoutes from './routes/task';
import authRoutes from './routes/auth';
import dotenv from 'dotenv';

// Loading environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Connecting to the database
connectDB();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Adding the router that handles login
app.use('/auth', authRoutes);

// Mounting the project and task routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
