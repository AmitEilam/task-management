import mongoose from 'mongoose'; // Importing the mongoose library for MongoDB object modeling

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    // Attempting to connect to the MongoDB using the URI stored in environment variables
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('MongoDB connected'); // Log success message when connected
  } catch (error) {
    // Log an error message if the connection fails
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the application if the connection fails
  }
};

// Exporting the connectDB function for use in other parts of the application
export default connectDB;
