import app from './app'; // Importing the Express application from the app module

const PORT = process.env.PORT || 5000; // Setting the port to listen on, defaulting to 5000 if not specified in the environment variables

// Starting the server and listening on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Logging a message indicating that the server has started successfully
});
