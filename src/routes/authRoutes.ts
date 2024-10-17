import express, { Request, Response } from 'express'; // Importing Express and its types for request and response handling
import { loginUser } from '../services/authService'; // Importing the loginUser function from the authService

const router = express.Router(); // Creating an Express router

// Handling POST requests to the /login endpoint
router.post('/login', async (req: Request, res: Response) => {
  const { username, password, newPassword } = req.body; // Extracting username, password, and newPassword from the request body

  try {
    // Calling the loginUser function with username, password, and newPassword
    const authResult = await loginUser(username, password, newPassword);

    if (authResult) {
      // If authentication is successful
      res.status(200).json({
        message: 'Login successful', // Success message
        token: authResult.IdToken, // Returning the IdToken to the user
      });
    } else {
      // If authentication fails
      res.status(400).json({
        message: 'Login failed', // Failure message
        error: 'Authentication result not found', // Error message
      });
    }
  } catch (error) {
    // Handling any errors that occur during the login process
    res.status(400).json({
      message: 'Login failed', // Failure message
      error: error instanceof Error ? error.message : 'Unknown error', // Returning the error message if available
    });
  }
});

export default router; // Exporting the router for use in other parts of the application
