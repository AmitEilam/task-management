import express from 'express'; // Importing Express framework
import bodyParser from 'body-parser'; // Importing body-parser to parse incoming request bodies
import connectDB from './config/db'; // Importing the database connection function
import projectRoutes from './routes/projectRoutes'; // Importing project routes
import taskRoutes from './routes/taskRoutes'; // Importing task routes
import authRouter from './routes/authRoutes'; // Importing authentication routes
import dotenv from 'dotenv'; // Importing dotenv to manage environment variables
import jwt from 'jsonwebtoken'; // Importing jsonwebtoken for token management

dotenv.config(); // Loading environment variables from .env file
const app = express(); // Creating an Express application
const PORT = process.env.PORT || 5003; // Setting the port to listen on
connectDB(); // Connecting to the database

// Middleware to parse JSON bodies
app.use(bodyParser.json()); // Using body-parser middleware to parse JSON request bodies

// Adding the router that handles login
app.use('/auth', authRouter); // Mounting the auth router on the /auth path

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Logging server start message
});

// Mounting the project and task routes
app.use('/api/projects', projectRoutes); // Mounting project routes on /api/projects path
app.use('/api/tasks', taskRoutes); // Mounting task routes on /api/tasks path

export default app; // Exporting the app instance for use in other modules
