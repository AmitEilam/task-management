import app from './app';

// Setting the port to listen on, defaulting to 5000 if not specified in the environment variables
const PORT = process.env.PORT || 5000;

// Starting the server and listening on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
